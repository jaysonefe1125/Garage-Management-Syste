"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

function readLaborerFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!name || !role) {
    throw new Error("Name and role are required.");
  }

  return {
    name,
    role,
    phone: optionalString(formData.get("phone")),
  };
}

export async function createLaborer(formData: FormData) {
  await requireUser();
  const data = readLaborerFields(formData);

  await prisma.laborer.create({ data });

  revalidatePath("/laborers");
  redirect("/laborers");
}

export async function updateLaborer(laborerId: number, formData: FormData) {
  await requireUser();
  const data = readLaborerFields(formData);

  await prisma.laborer.update({ where: { id: laborerId }, data });

  revalidatePath("/laborers");
  redirect("/laborers");
}

export async function deactivateLaborer(laborerId: number) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);

  await prisma.laborer.update({
    where: { id: laborerId },
    data: { active: false },
  });

  revalidatePath("/laborers");
  redirect("/laborers");
}
