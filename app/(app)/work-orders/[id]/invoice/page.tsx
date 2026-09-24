import { notFound } from "next/navigation";
import { buildDocumentModel } from "@/lib/pdf/documentModel";
import { formatCents } from "@/lib/money";
import { DocumentPreview } from "@/components/work-orders/DocumentPreview";

export default async function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrderId = parseInt(id, 10);

  const model = await buildDocumentModel(workOrderId).catch(() => null);
  if (!model) notFound();

  return (
    <DocumentPreview
      model={model}
      title="Invoice"
      downloadHref={`/api/work-orders/${workOrderId}/invoice-pdf`}
      balanceDue={formatCents(model.grandTotalCents)}
    />
  );
}
