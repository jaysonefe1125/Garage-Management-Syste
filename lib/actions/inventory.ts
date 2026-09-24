"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";
import { dollarsInputToCents } from "@/lib/money";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

function readItemFields(formData: FormData) {
  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!sku || !name) {
    throw new Error("SKU and name are required.");
  }

  return {
    sku,
    name,
    category: optionalString(formData.get("category")),
    costPriceCents: dollarsInputToCents(formData.get("costPriceDollars")),
    sellPriceCents: dollarsInputToCents(formData.get("sellPriceDollars")),
    reorderThreshold:
      parseInt(String(formData.get("reorderThreshold") ?? "0"), 10) || 0,
  };
}

export async function createInventoryItem(formData: FormData) {
  await requireUser();
  const data = readItemFields(formData);
  const initialQuantity =
    parseInt(String(formData.get("initialQuantity") ?? "0"), 10) || 0;

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.inventoryItem.create({
      data: { ...data, quantityOnHand: initialQuantity },
    });
    if (initialQuantity > 0) {
      await tx.stockMovement.create({
        data: {
          inventoryItemId: created.id,
          type: "RECEIVED",
          quantityChange: initialQuantity,
          note: "Initial stock",
        },
      });
    }
    return created;
  });

  revalidatePath("/inventory");
  redirect(`/inventory/${item.id}`);
}

export async function updateInventoryItem(itemId: number, formData: FormData) {
  await requireUser();
  const data = readItemFields(formData);

  await prisma.inventoryItem.update({ where: { id: itemId }, data });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${itemId}`);
  redirect(`/inventory/${itemId}`);
}

export async function deactivateInventoryItem(itemId: number) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);

  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { active: false },
  });

  revalidatePath("/inventory");
  redirect("/inventory");
}

const ADJUST_TYPES = ["RECEIVED", "SOLD_DIRECT", "ADJUSTED"] as const;
type AdjustType = (typeof ADJUST_TYPES)[number];

export async function adjustStock(itemId: number, formData: FormData) {
  const session = await requireUser();

  const type = String(formData.get("type") ?? "");
  if (!ADJUST_TYPES.includes(type as AdjustType)) {
    throw new Error("Invalid adjustment type.");
  }

  const rawQty = parseInt(String(formData.get("quantity") ?? ""), 10);
  if (!rawQty) {
    throw new Error("Enter a non-zero quantity.");
  }

  let quantityChange: number;
  if (type === "RECEIVED") quantityChange = Math.abs(rawQty);
  else if (type === "SOLD_DIRECT") quantityChange = -Math.abs(rawQty);
  else quantityChange = rawQty;

  const note = optionalString(formData.get("note"));

  await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.update({
      where: { id: itemId },
      data: { quantityOnHand: { increment: quantityChange } },
    });
    if (item.quantityOnHand < 0) {
      throw new Error("This adjustment would make quantity on hand negative.");
    }
    await tx.stockMovement.create({
      data: {
        inventoryItemId: itemId,
        type: type as AdjustType,
        quantityChange,
        note,
        createdByUserId: session.userId,
      },
    });
  });

  revalidatePath(`/inventory/${itemId}`);
  revalidatePath("/inventory");
}
