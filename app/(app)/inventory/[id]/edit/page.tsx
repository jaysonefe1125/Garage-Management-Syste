import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateInventoryItem } from "@/lib/actions/inventory";
import { centsToDollarsInput } from "@/lib/money";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = parseInt(id, 10);
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) notFound();

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>Edit Inventory Item</h1>
      <form
        action={updateInventoryItem.bind(null, item.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>SKU</label>
            <input name="sku" defaultValue={item.sku} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input name="name" defaultValue={item.name} required className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category (optional)</label>
          <input name="category" defaultValue={item.category ?? ""} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cost Price (₱)</label>
            <input
              name="costPriceDollars"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={centsToDollarsInput(item.costPriceCents)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Sell Price (₱)</label>
            <input
              name="sellPriceDollars"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={centsToDollarsInput(item.sellPriceCents)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Reorder Threshold</label>
          <input
            name="reorderThreshold"
            type="number"
            min="0"
            defaultValue={item.reorderThreshold}
            className={inputClass}
          />
        </div>

        <p className="text-xs text-muted">
          Quantity on hand can only be changed via stock adjustments on the item page.
        </p>

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
