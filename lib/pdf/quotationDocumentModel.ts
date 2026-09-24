import { prisma } from "@/lib/db";

export interface QuotationDocumentModel {
  quotationId: number;
  createdAt: Date;
  vehicleDescription: string;
  requestDescription: string;
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
  client: {
    name: string;
    contact: string | null;
  };
  laborItems: { description: string; amountCents: number }[];
  partItems: { description: string; quantity: number; estimatedPriceCents: number; totalCents: number }[];
  laborTotalCents: number;
  partsTotalCents: number;
  grandTotalCents: number;
  generatedAt: Date;
}

export async function buildQuotationDocumentModel(
  quotationId: number
): Promise<QuotationDocumentModel> {
  const [quotation, shopSettings] = await Promise.all([
    prisma.quotation.findUniqueOrThrow({
      where: { id: quotationId },
      include: {
        laborItems: { orderBy: { sortOrder: "asc" } },
        partItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.shopSettings.findFirst(),
  ]);

  const laborTotalCents = quotation.laborItems.reduce((sum, i) => sum + i.amountCents, 0);
  const partsTotalCents = quotation.partItems.reduce((sum, i) => sum + i.totalCents, 0);

  return {
    quotationId: quotation.id,
    createdAt: quotation.createdAt,
    vehicleDescription: quotation.vehicleDescription,
    requestDescription: quotation.requestDescription,
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
    client: {
      name: quotation.clientName,
      contact: quotation.clientContact,
    },
    laborItems: quotation.laborItems.map((i) => ({
      description: i.description,
      amountCents: i.amountCents,
    })),
    partItems: quotation.partItems.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      estimatedPriceCents: i.estimatedPriceCents,
      totalCents: i.totalCents,
    })),
    laborTotalCents,
    partsTotalCents,
    grandTotalCents: laborTotalCents + partsTotalCents,
    generatedAt: new Date(),
  };
}
