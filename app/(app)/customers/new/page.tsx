import { createCustomer } from "@/lib/actions/customers";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>New Customer</h1>
      <form
        action={createCustomer}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input name="firstName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input name="lastName" required className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Company (optional)</label>
          <input name="companyName" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input name="email" type="email" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input name="address" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" rows={3} className={inputClass} />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Create Customer
        </button>
      </form>
    </div>
  );
}
