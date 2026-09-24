"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

function readCustomerFields(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!firstName || !lastName || !phone) {
    throw new Error("First name, last name, and phone are required.");
  }

  return {
    firstName,
    lastName,
    phone,
    companyName: optionalString(formData.get("companyName")),
    email: optionalString(formData.get("email")),
    address: optionalString(formData.get("address")),
    notes: optionalString(formData.get("notes")),
  };
}

export async function createCustomer(formData: FormData) {
  await requireUser();
  const data = readCustomerFields(formData);

  const customer = await prisma.customer.create({ data });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(customerId: number, formData: FormData) {
  await requireUser();
  const data = readCustomerFields(formData);

  await prisma.customer.update({ where: { id: customerId }, data });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function deleteCustomer(customerId: number) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);

  try {
    await prisma.customer.delete({ where: { id: customerId } });
  } catch {
    throw new Error(
      "Could not delete this customer. They may still have work orders on file."
    );
  }

  revalidatePath("/customers");
  redirect("/customers");
}
