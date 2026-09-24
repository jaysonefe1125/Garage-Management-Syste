import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteVehicle } from "@/lib/actions/vehicles";
import { Badge, WorkOrderStatusBadge } from "@/components/ui/Badge";
import {
  secondaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicleId = parseInt(id, 10);
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      ownerLinks: { include: { customer: true } },
      workOrders: { orderBy: { dateOpened: "desc" } },
    },
  });
  if (!vehicle) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>
          {vehicle.year ?? ""} {vehicle.make} {vehicle.model}
        </h1>
        <div className="flex gap-2">
          <Link href={`/vehicles/${vehicle.id}/edit`} className={secondaryButtonClass}>
            Edit
          </Link>
          <form action={deleteVehicle.bind(null, vehicle.id)}>
            <button type="submit" className={dangerButtonClass}>
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4 text-sm">
        <div>
          <span className="text-muted">VIN:</span> {vehicle.vin ?? "—"}
        </div>
        <div>
          <span className="text-muted">Plate:</span> {vehicle.plate ?? "—"}
        </div>
        <div>
          <span className="text-muted">Color:</span> {vehicle.color ?? "—"}
        </div>
        <div>
          <span className="text-muted">Mileage:</span> {vehicle.mileage ?? "—"}
        </div>
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Owners</h2>
        <div className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
          {vehicle.ownerLinks.map((link) => (
            <Link
              key={link.id}
              href={`/customers/${link.customer.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-ink/[0.03]"
            >
              <span>
                {link.customer.firstName} {link.customer.lastName}
              </span>
              {link.isPrimary && <Badge>Primary</Badge>}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Service History</h2>
        <div className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
          {vehicle.workOrders.map((wo) => (
            <Link
              key={wo.id}
              href={`/work-orders/${wo.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-ink/[0.03]"
            >
              <span>{wo.description}</span>
              <span className="flex items-center gap-2 text-xs text-muted">
                {new Date(wo.dateOpened).toLocaleDateString()}
                <WorkOrderStatusBadge status={wo.status} />
              </span>
            </Link>
          ))}
          {vehicle.workOrders.length === 0 && (
            <div className="px-4 py-6 text-center text-muted">
              No service history yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
