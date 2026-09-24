import { createQuotation } from "@/lib/actions/quotations";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default function NewQuotationPage() {
  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>New Quotation</h1>
      <p className="mt-1 text-sm text-muted">
        For walk-in or phone inquiries — no need to create a customer record yet.
      </p>

      <form
        action={createQuotation}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input name="clientName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Contact Number (optional)</label>
            <input name="clientContact" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Vehicle</label>
          <input
            name="vehicleDescription"
            required
            placeholder="e.g. 2018 Toyota Vios, plate ABC-1234"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>What does the customer need?</label>
          <textarea
            name="requestDescription"
            rows={3}
            required
            placeholder="e.g. Repaint front bumper, replace headlight"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea name="notes" rows={2} className={inputClass} />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Create Quotation
        </button>
      </form>
    </div>
  );
}
