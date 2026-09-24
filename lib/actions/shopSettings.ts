"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

export async function updateShopSettings(formData: FormData) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);

  const businessName = String(formData.get("businessName") ?? "").trim();
  if (!businessName) {
    throw new Error("Business name is required.");
  }

  const existing = await prisma.shopSettings.findFirst();

  let logoPath = existing?.logoPath ?? null;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const blob = await put(`logos/logo-${Date.now()}-${logoFile.name}`, logoFile, {
      access: "public",
      addRandomSuffix: true,
    });
    logoPath = blob.url;
  }

  const data = {
    businessName,
    addressLine1: optionalString(formData.get("addressLine1")),
    addressLine2: optionalString(formData.get("addressLine2")),
    city: optionalString(formData.get("city")),
    state: optionalString(formData.get("state")),
    zip: optionalString(formData.get("zip")),
    phone: optionalString(formData.get("phone")),
    email: optionalString(formData.get("email")),
    taxId: optionalString(formData.get("taxId")),
    logoPath,
  };

  if (existing) {
    await prisma.shopSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.shopSettings.create({ data });
  }

  revalidatePath("/", "layout");
}
