import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteCustomer } from "@/lib/actions/customers";
import { Badge } from "@/components/ui/Badge";
import {
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customerId = parseInt(id, 10);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { vehicleLinks: { include: { vehicle: true } } },
  });
  if (!customer) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>
          {customer.firstName} {customer.lastName}
        </h1>
        <div className="flex gap-2">
          <Link href={`/customers/${customer.id}/edit`} className={secondaryButtonClass}>
            Edit
          </Link>
          <form action={deleteCustomer.bind(null, customer.id)}>
            <button type="submit" className={dangerButtonClass}>
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4 text-sm">
        <div>
          <span className="text-muted">Phone:</span> {customer.phone}
        </div>
        <div>
          <span className="text-muted">Email:</span> {customer.email ?? "—"}
        </div>
        <div>
          <span className="text-muted">Company:</span>{" "}
          {customer.companyName ?? "—"}
        </div>
        <div>
          <span className="text-muted">Address:</span> {customer.address ?? "—"}
        </div>
        {customer.notes && (
          <div className="col-span-2">
            <span className="text-muted">Notes:</span> {customer.notes}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className={sectionTitleClass}>Vehicles</h2>
        <Link
          href={`/vehicles/new?customerId=${customer.id}`}
          className={primaryButtonClass}
        >
          + Add Vehicle
        </Link>
      </div>
      <div className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
        {customer.vehicleLinks.map((link) => (
          <Link
            key={link.id}
            href={`/vehicles/${link.vehicle.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-ink/[0.03]"
          >
            <span>
              <span className="font-medium text-ink">
                {link.vehicle.year ?? ""} {link.vehicle.make} {link.vehicle.model}
              </span>
              {link.vehicle.plate && (
                <span className="ml-2 text-muted">Plate: {link.vehicle.plate}</span>
              )}
            </span>
            {link.isPrimary && <Badge>Primary owner</Badge>}
          </Link>
        ))}
        {customer.vehicleLinks.length === 0 && (
          <div className="px-4 py-6 text-center text-muted">
            No vehicles linked yet.
          </div>
        )}
      </div>
    </div>
  );
}
