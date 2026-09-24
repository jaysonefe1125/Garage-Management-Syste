import { notFound } from "next/navigation";
import { buildQuotationDocumentModel } from "@/lib/pdf/quotationDocumentModel";
import { formatCents } from "@/lib/money";
import { primaryButtonClass } from "@/components/ui/styles";

export default async function QuotationPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = parseInt(id, 10);

  const model = await buildQuotationDocumentModel(quotationId).catch(() => null);
  if (!model) notFound();

  const addressLine = [model.shop.city, model.shop.state, model.shop.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Quotation #{model.quotationId}
        </h1>
        <a
          href={`/api/quotations/${model.quotationId}/quotation-pdf`}
          className={primaryButtonClass}
          target="_blank"
          rel="noreferrer"
        >
          Download PDF
        </a>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-8 text-sm">
        <div className="flex items-start justify-between">
          <div>
            {model.shop.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={model.shop.logoUrl} alt="" className="mb-2 h-12 w-auto" />
            )}
            <div className="text-lg font-semibold">{model.shop.businessName}</div>
            {model.shop.addressLine1 && (
              <div className="text-gray-500">{model.shop.addressLine1}</div>
            )}
            {addressLine && <div className="text-gray-500">{addressLine}</div>}
            {model.shop.phone && <div className="text-gray-500">{model.shop.phone}</div>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">QUOTATION</div>
            <div className="text-gray-500">
              Date: {model.generatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Client</div>
          <div>{model.client.name}</div>
          {model.client.contact && <div>{model.client.contact}</div>}
        </div>

        <div className="mt-4">
          <div className="font-semibold text-gray-700">Vehicle</div>
          <div>{model.vehicleDescription}</div>
        </div>

        <div className="mt-4">
          <div className="font-semibold text-gray-700">Request</div>
          <p>{model.requestDescription}</p>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Labor</div>
          <table className="mt-1 w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1">Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {model.laborItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.description}</td>
                  <td>{formatCents(item.amountCents)}</td>
                </tr>
              ))}
              {model.laborItems.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-2 text-gray-400">
                    No labor lines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Parts (estimated)</div>
          <table className="mt-1 w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1">Description</th>
                <th>Qty</th>
                <th>Est. Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {model.partItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCents(item.estimatedPriceCents)}</td>
                  <td>{formatCents(item.totalCents)}</td>
                </tr>
              ))}
              {model.partItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-2 text-gray-400">
                    No parts listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Labor Total</span>
              <span>{formatCents(model.laborTotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Parts Total</span>
              <span>{formatCents(model.partsTotalCents)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold">
              <span>Estimated Total</span>
              <span>{formatCents(model.grandTotalCents)}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          This is a quotation only and does not constitute a binding order. Prices are
          estimates and may change once the vehicle is inspected. Valid for 7 days from the
          date issued.
        </p>
      </div>
    </div>
  );
}
