import { createLaborer } from "@/lib/actions/laborers";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

const ROLE_SUGGESTIONS = ["Painter", "Mechanic", "Car Washer", "Detailer"];

export default function NewLaborerPage() {
  return (
    <div className="max-w-md">
      <h1 className={pageTitleClass}>New Laborer</h1>
      <form
        action={createLaborer}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Role</label>
          <input
            name="role"
            required
            list="role-suggestions"
            placeholder="e.g. Mechanic"
            className={inputClass}
          />
          <datalist id="role-suggestions">
            {ROLE_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input name="phone" className={inputClass} />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Create Laborer
        </button>
      </form>
    </div>
  );
}
