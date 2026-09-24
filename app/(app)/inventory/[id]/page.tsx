import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { adjustStock, deactivateInventoryItem } from "@/lib/actions/inventory";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = parseInt(id, 10);
  const item = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: {
      stockMovements: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) notFound();

  const low = item.quantityOnHand <= item.reorderThreshold;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>{item.name}</h1>
        <div className="flex gap-2">
          <Link href={`/inventory/${item.id}/edit`} className={secondaryButtonClass}>
            Edit
          </Link>
          <form action={deactivateInventoryItem.bind(null, item.id)}>
            <button type="submit" className={dangerButtonClass}>
              Deactivate
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4 text-sm">
        <div>
          <span className="text-muted">SKU:</span> {item.sku}
        </div>
        <div>
          <span className="text-muted">Category:</span> {item.category ?? "—"}
        </div>
        <div>
          <span className="text-muted">Cost Price:</span>{" "}
          {formatCents(item.costPriceCents)}
        </div>
        <div>
          <span className="text-muted">Sell Price:</span>{" "}
          {formatCents(item.sellPriceCents)}
        </div>
        <div>
          <span className="text-muted">On Hand:</span> {item.quantityOnHand}
          {low && (
            <span className="ml-2 rounded bg-danger-bg px-1.5 py-0.5 text-xs text-danger">
              Low stock
            </span>
          )}
        </div>
        <div>
          <span className="text-muted">Reorder Threshold:</span>{" "}
          {item.reorderThreshold}
        </div>
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Adjust Stock</h2>
        <form
          key={item.stockMovements.length}
          action={adjustStock.bind(null, item.id)}
          className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4"
        >
          <div>
            <label className={labelClass}>Type</label>
            <select name="type" className={inputClass} defaultValue="RECEIVED">
              <option value="RECEIVED">Received</option>
              <option value="SOLD_DIRECT">Sold Direct</option>
              <option value="ADJUSTED">Adjusted (correction)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input
              name="quantity"
              type="number"
              required
              className={inputClass}
              placeholder="e.g. 10 or -2 for Adjusted"
            />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Note (optional)</label>
            <input name="note" className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Apply
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Stock Movement Log</h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-muted">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Change</th>
                <th className="px-4 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {item.stockMovements.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{m.type}</td>
                  <td
                    className={`px-4 py-2 ${
                      m.quantityChange < 0 ? "text-danger" : "text-olive"
                    }`}
                  >
                    {m.quantityChange > 0 ? "+" : ""}
                    {m.quantityChange}
                  </td>
                  <td className="px-4 py-2">{m.note ?? "—"}</td>
                </tr>
              ))}
              {item.stockMovements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted">
                    No stock movements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
