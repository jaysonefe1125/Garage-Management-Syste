import { formatCents } from "@/lib/money";
import type { DocumentModel } from "@/lib/pdf/documentModel";
import { primaryButtonClass } from "@/components/ui/styles";

export function DocumentPreview({
  model,
  title,
  downloadHref,
  showSignatures,
  balanceDue,
}: {
  model: DocumentModel;
  title: string;
  downloadHref: string;
  showSignatures?: boolean;
  balanceDue?: string;
}) {
  const addressLine = [model.shop.city, model.shop.state, model.shop.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {title} — Work Order #{model.workOrderId}
        </h1>
        <a
          href={downloadHref}
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
            {model.shop.addressLine2 && (
              <div className="text-gray-500">{model.shop.addressLine2}</div>
            )}
            {addressLine && <div className="text-gray-500">{addressLine}</div>}
            {model.shop.phone && <div className="text-gray-500">{model.shop.phone}</div>}
            {model.shop.email && <div className="text-gray-500">{model.shop.email}</div>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{title.toUpperCase()}</div>
            <div className="text-gray-500">
              Date: {model.generatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-700">Customer</div>
            <div>{model.customer.name}</div>
            <div>{model.customer.phone}</div>
            {model.customer.email && <div>{model.customer.email}</div>}
          </div>
          <div>
            <div className="font-semibold text-gray-700">Vehicle</div>
            <div>{model.vehicle.label}</div>
            {model.vehicle.plate && <div>Plate: {model.vehicle.plate}</div>}
            {model.vehicle.mileage != null && <div>Mileage: {model.vehicle.mileage}</div>}
          </div>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Description of Work</div>
          <p>{model.description}</p>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Labor</div>
          <table className="mt-1 w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1">Description</th>
                <th>Laborer</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {model.laborItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.description}</td>
                  <td>{item.laborerName}</td>
                  <td>{formatCents(item.totalCents)}</td>
                </tr>
              ))}
              {model.laborItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-2 text-gray-400">
                    No labor items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <div className="font-semibold text-gray-700">Parts</div>
          <table className="mt-1 w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1">Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {model.partItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCents(item.unitPriceCents)}</td>
                  <td>{formatCents(item.totalCents)}</td>
                </tr>
              ))}
              {model.partItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-2 text-gray-400">
                    No parts used.
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
              <span>Grand Total</span>
              <span>{formatCents(model.grandTotalCents)}</span>
            </div>
            {balanceDue && (
              <div className="mt-2 flex justify-between font-semibold">
                <span>Balance Due</span>
                <span>{balanceDue}</span>
              </div>
            )}
          </div>
        </div>

        {showSignatures && (
          <div className="mt-10 grid grid-cols-2 gap-8 text-xs text-gray-500">
            <div className="border-t border-gray-900 pt-1">Customer Signature / Date</div>
            <div className="border-t border-gray-900 pt-1">
              Shop Representative / Date
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
