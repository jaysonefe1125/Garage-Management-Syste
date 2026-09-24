import { notFound } from "next/navigation";
import { buildDocumentModel } from "@/lib/pdf/documentModel";
import { DocumentPreview } from "@/components/work-orders/DocumentPreview";

export default async function EstimatePreviewPage({
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
      title="Estimate"
      downloadHref={`/api/work-orders/${workOrderId}/estimate-pdf`}
      showSignatures
    />
  );
}
