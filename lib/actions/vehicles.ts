"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser, assertRole } from "@/lib/session";

function optionalString(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

function optionalInt(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) return null;
  const n = parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
}

function readVehicleFields(formData: FormData) {
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();

  if (!make || !model) {
    throw new Error("Make and model are required.");
  }

  return {
    make,
    model,
    vin: optionalString(formData.get("vin")),
    year: optionalInt(formData.get("year")),
    plate: optionalString(formData.get("plate")),
    color: optionalString(formData.get("color")),
    mileage: optionalInt(formData.get("mileage")),
  };
}

function readOwnerSelection(formData: FormData) {
  const ownerIds = formData
    .getAll("ownerCustomerIds")
    .map((v) => parseInt(String(v), 10))
    .filter((n) => !Number.isNaN(n));

  if (ownerIds.length === 0) {
    throw new Error("At least one owner is required.");
  }

  const rawPrimary = formData.get("primaryOwnerId");
  const primaryOwnerId = rawPrimary
    ? parseInt(String(rawPrimary), 10)
    : ownerIds[0];

  return { ownerIds, primaryOwnerId };
}

export async function createVehicle(formData: FormData) {
  await requireUser();
  const data = readVehicleFields(formData);
  const { ownerIds, primaryOwnerId } = readOwnerSelection(formData);

  const vehicle = await prisma.vehicle.create({
    data: {
      ...data,
      ownerLinks: {
        create: ownerIds.map((customerId) => ({
          customerId,
          isPrimary: customerId === primaryOwnerId,
        })),
      },
    },
  });

  revalidatePath("/customers");
  redirect(`/vehicles/${vehicle.id}`);
}

export async function updateVehicle(vehicleId: number, formData: FormData) {
  await requireUser();
  const data = readVehicleFields(formData);
  const { ownerIds, primaryOwnerId } = readOwnerSelection(formData);

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({ where: { id: vehicleId }, data });
    await tx.vehicleOwner.deleteMany({
      where: { vehicleId, customerId: { notIn: ownerIds } },
    });
    for (const customerId of ownerIds) {
      await tx.vehicleOwner.upsert({
        where: { vehicleId_customerId: { vehicleId, customerId } },
        create: { vehicleId, customerId, isPrimary: customerId === primaryOwnerId },
        update: { isPrimary: customerId === primaryOwnerId },
      });
    }
  });

  revalidatePath("/customers");
  revalidatePath(`/vehicles/${vehicleId}`);
  redirect(`/vehicles/${vehicleId}`);
}

export async function deleteVehicle(vehicleId: number) {
  const session = await requireUser();
  assertRole(session, ["ADMIN"]);

  const primaryLink = await prisma.vehicleOwner.findFirst({
    where: { vehicleId },
    orderBy: { isPrimary: "desc" },
  });

  try {
    await prisma.vehicle.delete({ where: { id: vehicleId } });
  } catch {
    throw new Error(
      "Could not delete this vehicle. It may still have work orders on file."
    );
  }

  revalidatePath("/customers");
  redirect(primaryLink ? `/customers/${primaryLink.customerId}` : "/customers");
}
