import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import {
  addQuotationLaborItem,
  addQuotationPartItem,
  deleteQuotation,
  deleteQuotationLaborItem,
  deleteQuotationPartItem,
} from "@/lib/actions/quotations";
import { ConvertToWorkOrderForm } from "@/components/quotations/ConvertToWorkOrderForm";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = parseInt(id, 10);

  const [quotation, customers] = await Promise.all([
    prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        laborItems: { orderBy: { sortOrder: "asc" } },
        partItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.customer.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { vehicleLinks: { include: { vehicle: true } } },
    }),
  ]);

  if (!quotation) notFound();

  const pending = quotation.status === "PENDING";
  const laborTotal = quotation.laborItems.reduce((sum, i) => sum + i.amountCents, 0);
  const partsTotal = quotation.partItems.reduce((sum, i) => sum + i.totalCents, 0);
  const grandTotal = laborTotal + partsTotal;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={pageTitleClass}>{quotation.clientName}</h1>
          <p className="mt-1 text-sm text-muted">{quotation.vehicleDescription}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/quotations/${quotation.id}/print`} className={secondaryButtonClass}>
            Preview / Print
          </Link>
          {pending && (
            <>
              <Link
                href={`/quotations/${quotation.id}/edit`}
                className={secondaryButtonClass}
              >
                Edit
              </Link>
              <form action={deleteQuotation.bind(null, quotation.id)}>
                <button type="submit" className={dangerButtonClass}>
                  Delete
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4 text-sm">
        <div>
          <span className="text-muted">Contact:</span> {quotation.clientContact ?? "—"}
        </div>
        <div>
          <span className="text-muted">Status:</span>{" "}
          {quotation.status === "CONVERTED" ? (
            <Link
              href={`/work-orders/${quotation.convertedWorkOrderId}`}
              className="text-accent-ink hover:underline"
            >
              Converted → Work Order #{quotation.convertedWorkOrderId}
            </Link>
          ) : (
            "Pending"
          )}
        </div>
        <div className="col-span-2">
          <span className="text-muted">Request:</span> {quotation.requestDescription}
        </div>
        {quotation.notes && (
          <div className="col-span-2">
            <span className="text-muted">Notes:</span> {quotation.notes}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Labor</h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-muted">
              <tr>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Amount</th>
                {pending && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {quotation.laborItems.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{formatCents(item.amountCents)}</td>
                  {pending && (
                    <td className="px-4 py-2 text-right">
                      <form
                        action={deleteQuotationLaborItem.bind(null, item.id, quotation.id)}
                      >
                        <button
                          type="submit"
                          className="text-xs text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {quotation.laborItems.length === 0 && (
                <tr>
                  <td
                    colSpan={pending ? 3 : 2}
                    className="px-4 py-4 text-center text-muted"
                  >
                    No labor lines yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pending && (
          <form
            key={quotation.laborItems.length}
            action={addQuotationLaborItem.bind(null, quotation.id)}
            className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4"
          >
            <div className="flex-1">
              <label className={labelClass}>Description</label>
              <input name="description" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (₱)</label>
              <input
                name="amountDollars"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputClass}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Add Labor
            </button>
          </form>
        )}
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Parts (ad-hoc)</h2>
        <p className="mt-1 text-xs text-muted">
          Not linked to inventory — for estimate purposes only.
        </p>
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-muted">
              <tr>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Est. Price</th>
                <th className="px-4 py-2">Total</th>
                {pending && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {quotation.partItems.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{formatCents(item.estimatedPriceCents)}</td>
                  <td className="px-4 py-2">{formatCents(item.totalCents)}</td>
                  {pending && (
                    <td className="px-4 py-2 text-right">
                      <form
                        action={deleteQuotationPartItem.bind(null, item.id, quotation.id)}
                      >
                        <button
                          type="submit"
                          className="text-xs text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {quotation.partItems.length === 0 && (
                <tr>
                  <td
                    colSpan={pending ? 5 : 4}
                    className="px-4 py-4 text-center text-muted"
                  >
                    No parts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pending && (
          <form
            key={quotation.partItems.length}
            action={addQuotationPartItem.bind(null, quotation.id)}
            className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4"
          >
            <div className="flex-1">
              <label className={labelClass}>Description</label>
              <input
                name="description"
                required
                placeholder="e.g. Headlight assembly (aftermarket)"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Qty</label>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Est. Price (₱)</label>
              <input
                name="priceDollars"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputClass}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Add Part
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-64 rounded-lg border border-line bg-panel p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Labor Total</span>
            <span>{formatCents(laborTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">Parts Total</span>
            <span>{formatCents(partsTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
            <span>Grand Total</span>
            <span>{formatCents(grandTotal)}</span>
          </div>
        </div>
      </div>

      {pending && (
        <div className="mt-6">
          <h2 className={sectionTitleClass}>Convert to Work Order</h2>
          <p className="mt-1 text-sm text-muted">
            Once the customer decides to proceed, convert this quotation into a real work
            order.
          </p>
          <div className="mt-2">
            <ConvertToWorkOrderForm quotationId={quotation.id} customers={customers} />
          </div>
        </div>
      )}
    </div>
  );
}
