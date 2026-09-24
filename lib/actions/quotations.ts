"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { dollarsInputToCents } from "@/lib/money";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

async function assertPending(quotationId: number) {
  const quotation = await prisma.quotation.findUniqueOrThrow({
    where: { id: quotationId },
    select: { status: true },
  });
  if (quotation.status !== "PENDING") {
    throw new Error("This quotation has already been converted and can no longer be edited.");
  }
}

function readQuotationFields(formData: FormData) {
  const clientName = String(formData.get("clientName") ?? "").trim();
  const vehicleDescription = String(formData.get("vehicleDescription") ?? "").trim();
  const requestDescription = String(formData.get("requestDescription") ?? "").trim();

  if (!clientName || !vehicleDescription || !requestDescription) {
    throw new Error(
      "Client name, vehicle description, and request description are required."
    );
  }

  return {
    clientName,
    vehicleDescription,
    requestDescription,
    clientContact: optionalString(formData.get("clientContact")),
    notes: optionalString(formData.get("notes")),
  };
}

export async function createQuotation(formData: FormData) {
  await requireUser();
  const data = readQuotationFields(formData);

  const quotation = await prisma.quotation.create({ data });

  revalidatePath("/quotations");
  redirect(`/quotations/${quotation.id}`);
}

export async function updateQuotation(quotationId: number, formData: FormData) {
  await requireUser();
  await assertPending(quotationId);
  const data = readQuotationFields(formData);

  await prisma.quotation.update({ where: { id: quotationId }, data });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);
  redirect(`/quotations/${quotationId}`);
}

export async function deleteQuotation(quotationId: number) {
  await requireUser();
  await assertPending(quotationId);

  await prisma.quotation.delete({ where: { id: quotationId } });

  revalidatePath("/quotations");
  redirect("/quotations");
}

// --- Labor lines (no laborer assignment yet — not committed work) ---

export async function addQuotationLaborItem(quotationId: number, formData: FormData) {
  await requireUser();
  await assertPending(quotationId);

  const description = String(formData.get("description") ?? "").trim();
  const amountCents = dollarsInputToCents(formData.get("amountDollars"));

  if (!description || amountCents <= 0) {
    throw new Error("Description and a positive amount are required.");
  }

  const count = await prisma.quotationLaborItem.count({ where: { quotationId } });

  await prisma.quotationLaborItem.create({
    data: { quotationId, description, amountCents, sortOrder: count },
  });

  revalidatePath(`/quotations/${quotationId}`);
}

export async function deleteQuotationLaborItem(itemId: number, quotationId: number) {
  await requireUser();
  await assertPending(quotationId);

  await prisma.quotationLaborItem.delete({ where: { id: itemId } });

  revalidatePath(`/quotations/${quotationId}`);
}

// --- Ad-hoc parts (not linked to inventory — estimate only) ---

export async function addQuotationPartItem(quotationId: number, formData: FormData) {
  await requireUser();
  await assertPending(quotationId);

  const description = String(formData.get("description") ?? "").trim();
  const quantity = parseInt(String(formData.get("quantity") ?? ""), 10);
  const estimatedPriceCents = dollarsInputToCents(formData.get("priceDollars"));

  if (!description || !quantity || quantity <= 0 || estimatedPriceCents <= 0) {
    throw new Error("Description, a positive quantity, and a positive price are required.");
  }

  const count = await prisma.quotationPartItem.count({ where: { quotationId } });

  await prisma.quotationPartItem.create({
    data: {
      quotationId,
      description,
      quantity,
      estimatedPriceCents,
      totalCents: quantity * estimatedPriceCents,
      sortOrder: count,
    },
  });

  revalidatePath(`/quotations/${quotationId}`);
}

export async function deleteQuotationPartItem(itemId: number, quotationId: number) {
  await requireUser();
  await assertPending(quotationId);

  await prisma.quotationPartItem.delete({ where: { id: itemId } });

  revalidatePath(`/quotations/${quotationId}`);
}

// --- Convert to a real Work Order ---

export async function convertQuotationToWorkOrder(quotationId: number, formData: FormData) {
  await requireUser();
  await assertPending(quotationId);

  const customerId = parseInt(String(formData.get("customerId") ?? ""), 10);
  const vehicleId = parseInt(String(formData.get("vehicleId") ?? ""), 10);

  if (Number.isNaN(customerId) || Number.isNaN(vehicleId)) {
    throw new Error("Select a customer and vehicle to convert this quotation.");
  }

  const quotation = await prisma.quotation.findUniqueOrThrow({
    where: { id: quotationId },
  });

  const workOrder = await prisma.$transaction(async (tx) => {
    const created = await tx.workOrder.create({
      data: {
        customerId,
        vehicleId,
        description: quotation.requestDescription,
      },
    });
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: "CONVERTED", convertedWorkOrderId: created.id },
    });
    return created;
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);
  redirect(`/work-orders/${workOrder.id}`);
}
