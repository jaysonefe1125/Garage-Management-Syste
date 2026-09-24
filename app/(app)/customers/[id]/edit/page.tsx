import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateCustomer } from "@/lib/actions/customers";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customerId = parseInt(id, 10);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) notFound();

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>Edit Customer</h1>
      <form
        action={updateCustomer.bind(null, customer.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              name="firstName"
              defaultValue={customer.firstName}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              name="lastName"
              defaultValue={customer.lastName}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Company (optional)</label>
          <input
            name="companyName"
            defaultValue={customer.companyName ?? ""}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              defaultValue={customer.phone}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={customer.email ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input
            name="address"
            defaultValue={customer.address ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={customer.notes ?? ""}
            className={inputClass}
          />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
