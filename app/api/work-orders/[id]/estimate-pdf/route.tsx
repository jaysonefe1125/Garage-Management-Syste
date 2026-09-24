import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildDocumentModel } from "@/lib/pdf/documentModel";
import { EstimateDocument } from "@/lib/pdf/EstimateDocument";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const workOrderId = parseInt(id, 10);
  const model = await buildDocumentModel(workOrderId);
  const buffer = await renderToBuffer(<EstimateDocument model={model} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="estimate-wo-${workOrderId}.pdf"`,
    },
  });
}
