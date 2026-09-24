import Link from "next/link";
import { prisma } from "@/lib/db";
import { primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { vehicleLinks: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Customers</h1>
        <Link href="/customers/new" className={primaryButtonClass}>
          + New Customer
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-muted">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Vehicles</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-line hover:bg-ink/[0.03]">
                <td className="px-4 py-2">
                  <Link
                    href={`/customers/${c.id}`}
                    className="text-accent-ink hover:underline"
                  >
                    {c.firstName} {c.lastName}
                  </Link>
                  {c.companyName && (
                    <span className="ml-1 text-muted">({c.companyName})</span>
                  )}
                </td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">{c.email ?? "—"}</td>
                <td className="px-4 py-2">{c.vehicleLinks.length}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No customers yet.{" "}
                  <Link href="/customers/new" className="text-accent-ink hover:underline">
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
