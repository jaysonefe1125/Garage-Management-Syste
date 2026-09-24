import { prisma } from "@/lib/db";

export interface DocumentModel {
  workOrderId: number;
  status: string;
  dateOpened: Date;
  description: string;
  mileageIn: number | null;
  mileageOut: number | null;
  shop: {
    businessName: string;
    logoUrl: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    email: string | null;
  };
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
  };
  vehicle: {
    label: string;
    vin: string | null;
    plate: string | null;
    color: string | null;
    mileage: number | null;
  };
  laborItems: {
    description: string;
    laborerName: string;
    totalCents: number;
  }[];
  partItems: {
    description: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }[];
  laborTotalCents: number;
  partsTotalCents: number;
  grandTotalCents: number;
  generatedAt: Date;
}

export async function buildDocumentModel(workOrderId: number): Promise<DocumentModel> {
  const [workOrder, shopSettings] = await Promise.all([
    prisma.workOrder.findUniqueOrThrow({
      where: { id: workOrderId },
      include: {
        customer: true,
        vehicle: true,
        laborItems: { orderBy: { sortOrder: "asc" }, include: { laborer: true } },
        partItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.shopSettings.findFirst(),
  ]);

  const laborTotalCents = workOrder.laborItems.reduce((sum, i) => sum + i.totalCents, 0);
  const partsTotalCents = workOrder.partItems.reduce((sum, i) => sum + i.totalCents, 0);

  return {
    workOrderId: workOrder.id,
    status: workOrder.status,
    dateOpened: workOrder.dateOpened,
    description: workOrder.description,
    mileageIn: workOrder.mileageIn,
    mileageOut: workOrder.mileageOut,
    shop: {
      businessName: shopSettings?.businessName ?? "Garage Service System",
      logoUrl: shopSettings?.logoPath ?? null,
      addressLine1: shopSettings?.addressLine1 ?? null,
      addressLine2: shopSettings?.addressLine2 ?? null,
      city: shopSettings?.city ?? null,
      state: shopSettings?.state ?? null,
      zip: shopSettings?.zip ?? null,
      phone: shopSettings?.phone ?? null,
      email: shopSettings?.email ?? null,
    },
    customer: {
      name: `${workOrder.customer.firstName} ${workOrder.customer.lastName}`,
      phone: workOrder.customer.phone,
      email: workOrder.customer.email,
      address: workOrder.customer.address,
    },
    vehicle: {
      label: `${workOrder.vehicle.year ?? ""} ${workOrder.vehicle.make} ${workOrder.vehicle.model}`.trim(),
      vin: workOrder.vehicle.vin,
      plate: workOrder.vehicle.plate,
      color: workOrder.vehicle.color,
      mileage: workOrder.vehicle.mileage,
    },
    laborItems: workOrder.laborItems.map((i) => ({
      description: i.description,
      laborerName: i.laborer.name,
      totalCents: i.totalCents,
    })),
    partItems: workOrder.partItems.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      totalCents: i.totalCents,
    })),
    laborTotalCents,
    partsTotalCents,
    grandTotalCents: laborTotalCents + partsTotalCents,
    generatedAt: new Date(),
  };
}
