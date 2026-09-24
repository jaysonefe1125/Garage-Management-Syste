import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { primaryButtonClass, pageTitleClass } from "@/components/ui/styles";
import { Badge } from "@/components/ui/Badge";

export default async function InventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Inventory</h1>
        <Link href="/inventory/new" className={primaryButtonClass}>
          + New Item
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-muted">
            <tr>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Sell</th>
              <th className="px-4 py-2">On Hand</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.quantityOnHand <= item.reorderThreshold;
              return (
                <tr
                  key={item.id}
                  className={`border-t border-line hover:bg-ink/[0.03] ${
                    low ? "bg-danger-bg" : ""
                  }`}
                >
                  <td className="px-4 py-2">{item.sku}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/inventory/${item.id}`}
                      className="text-accent-ink hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{item.category ?? "—"}</td>
                  <td className="px-4 py-2">{formatCents(item.costPriceCents)}</td>
                  <td className="px-4 py-2">{formatCents(item.sellPriceCents)}</td>
                  <td className="px-4 py-2">
                    {item.quantityOnHand}
                    {low && (
                      <span className="ml-2">
                        <Badge tone="danger">Low stock</Badge>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  No inventory items yet.{" "}
                  <Link href="/inventory/new" className="text-accent-ink hover:underline">
                    Add one
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
