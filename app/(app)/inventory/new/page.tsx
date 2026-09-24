import { createInventoryItem } from "@/lib/actions/inventory";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default function NewInventoryItemPage() {
  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>New Inventory Item</h1>
      <form
        action={createInventoryItem}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>SKU</label>
            <input name="sku" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input name="name" required className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category (optional)</label>
          <input name="category" className={inputClass} />
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
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Initial Quantity</label>
            <input
              name="initialQuantity"
              type="number"
              min="0"
              defaultValue="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Reorder Threshold</label>
            <input
              name="reorderThreshold"
              type="number"
              min="0"
              defaultValue="0"
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" className={primaryButtonClass}>
          Create Item
        </button>
      </form>
    </div>
  );
}
