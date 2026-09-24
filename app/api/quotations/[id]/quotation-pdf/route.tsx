import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildQuotationDocumentModel } from "@/lib/pdf/quotationDocumentModel";
import { QuotationDocument } from "@/lib/pdf/QuotationDocument";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quotationId = parseInt(id, 10);
  const model = await buildQuotationDocumentModel(quotationId);
  const buffer = await renderToBuffer(<QuotationDocument model={model} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="quotation-${quotationId}.pdf"`,
    },
  });
}
