"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";
import { dollarsInputToCents } from "@/lib/money";

const LOCKED_STATUSES = ["INVOICED", "CLOSED"] as const;

function optionalInt(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) return null;
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
}

async function assertEditable(workOrderId: number) {
  const workOrder = await prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
    select: { status: true },
  });
  if (LOCKED_STATUSES.includes(workOrder.status as (typeof LOCKED_STATUSES)[number])) {
    throw new Error(
      `This work order is ${workOrder.status.toLowerCase()} and can no longer be edited.`
    );
  }
}

export async function createWorkOrder(formData: FormData) {
  await requireUser();

  const customerId = parseInt(String(formData.get("customerId") ?? ""), 10);
  const vehicleId = parseInt(String(formData.get("vehicleId") ?? ""), 10);
  const description = String(formData.get("description") ?? "").trim();

  if (Number.isNaN(customerId) || Number.isNaN(vehicleId) || !description) {
    throw new Error("Customer, vehicle, and description are required.");
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId,
      vehicleId,
      description,
      mileageIn: optionalInt(formData.get("mileageIn")),
    },
  });

  revalidatePath("/work-orders");
  redirect(`/work-orders/${workOrder.id}`);
}

export async function updateWorkOrder(workOrderId: number, formData: FormData) {
  await requireUser();
  await assertEditable(workOrderId);

  const description = String(formData.get("description") ?? "").trim();
  if (!description) {
    throw new Error("Description is required.");
  }

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      description,
      mileageIn: optionalInt(formData.get("mileageIn")),
      mileageOut: optionalInt(formData.get("mileageOut")),
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  redirect(`/work-orders/${workOrderId}`);
}

const STATUS_VALUES = [
  "INTAKE",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "COMPLETED",
  "INVOICED",
  "CLOSED",
] as const;

export async function updateWorkOrderStatus(workOrderId: number, formData: FormData) {
  await requireUser();

  const status = String(formData.get("status") ?? "");
  if (!STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    throw new Error("Invalid status.");
  }

  const current = await prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
    select: { status: true },
  });

  if (current.status === "CLOSED") {
    throw new Error("This work order is closed and its status can no longer change.");
  }
  if (current.status === "INVOICED" && status !== "CLOSED" && status !== "INVOICED") {
    throw new Error("An invoiced work order can only move forward to Closed.");
  }

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      status: status as (typeof STATUS_VALUES)[number],
      dateClosed: status === "CLOSED" ? new Date() : undefined,
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath("/work-orders");
}

export async function deleteWorkOrder(workOrderId: number) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);
  await assertEditable(workOrderId);

  await prisma.workOrder.delete({ where: { id: workOrderId } });

  revalidatePath("/work-orders");
  redirect("/work-orders");
}

// --- Labor line items ---

export async function addLaborItem(workOrderId: number, formData: FormData) {
  await requireUser();
  await assertEditable(workOrderId);

  const description = String(formData.get("description") ?? "").trim();
  const laborerId = parseInt(String(formData.get("laborerId") ?? ""), 10);
  const amountCents = dollarsInputToCents(formData.get("amountDollars"));

  if (!description || Number.isNaN(laborerId) || amountCents <= 0) {
    throw new Error("Description, a laborer, and a positive amount are required.");
  }

  const count = await prisma.workOrderLaborItem.count({ where: { workOrderId } });

  await prisma.workOrderLaborItem.create({
    data: {
      workOrderId,
      description,
      laborerId,
      amountCents,
      totalCents: amountCents,
      sortOrder: count,
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
}

export async function deleteLaborItem(itemId: number, workOrderId: number) {
  await requireUser();
  await assertEditable(workOrderId);

  await prisma.workOrderLaborItem.delete({ where: { id: itemId } });

  revalidatePath(`/work-orders/${workOrderId}`);
}

// --- Parts line items ---

export async function addPartItem(workOrderId: number, formData: FormData) {
  await requireUser();
  await assertEditable(workOrderId);

  const inventoryItemId = parseInt(String(formData.get("inventoryItemId") ?? ""), 10);
  const quantity = parseInt(String(formData.get("quantity") ?? ""), 10);

  if (Number.isNaN(inventoryItemId) || !quantity || quantity <= 0) {
    throw new Error("Select a part and a positive quantity.");
  }

  await prisma.$transaction(async (tx) => {
    const inventoryItem = await tx.inventoryItem.findUniqueOrThrow({
      where: { id: inventoryItemId },
    });

    const updated = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { quantityOnHand: { decrement: quantity } },
    });
    if (updated.quantityOnHand < 0) {
      throw new Error(`Not enough stock of "${inventoryItem.name}" on hand.`);
    }

    const count = await tx.workOrderPartItem.count({ where: { workOrderId } });

    await tx.workOrderPartItem.create({
      data: {
        workOrderId,
        inventoryItemId,
        description: inventoryItem.name,
        quantity,
        unitCostCents: inventoryItem.costPriceCents,
        unitPriceCents: inventoryItem.sellPriceCents,
        totalCents: quantity * inventoryItem.sellPriceCents,
        sortOrder: count,
      },
    });

    await tx.stockMovement.create({
      data: {
        inventoryItemId,
        type: "USED_ON_WORK_ORDER",
        quantityChange: -quantity,
        relatedWorkOrderId: workOrderId,
      },
    });
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath("/inventory");
}

export async function deletePartItem(itemId: number, workOrderId: number) {
  await requireUser();
  await assertEditable(workOrderId);

  await prisma.$transaction(async (tx) => {
    const partItem = await tx.workOrderPartItem.delete({ where: { id: itemId } });

    await tx.inventoryItem.update({
      where: { id: partItem.inventoryItemId },
      data: { quantityOnHand: { increment: partItem.quantity } },
    });

    await tx.stockMovement.create({
      data: {
        inventoryItemId: partItem.inventoryItemId,
        type: "USED_ON_WORK_ORDER",
        quantityChange: partItem.quantity,
        relatedWorkOrderId: workOrderId,
        note: "Reversed: line item removed",
      },
    });
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath("/inventory");
}
