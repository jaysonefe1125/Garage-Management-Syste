import Link from "next/link";
import { prisma } from "@/lib/db";
import { primaryButtonClass, pageTitleClass } from "@/components/ui/styles";
import { WorkOrderStatusBadge } from "@/components/ui/Badge";

export default async function WorkOrdersPage() {
  const workOrders = await prisma.workOrder.findMany({
    orderBy: { dateOpened: "desc" },
    include: { customer: true, vehicle: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Work Orders</h1>
        <Link href="/work-orders/new" className={primaryButtonClass}>
          + New Work Order
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-muted">
            <tr>
              <th className="px-4 py-2">Opened</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo) => (
              <tr key={wo.id} className="border-t border-line hover:bg-ink/[0.03]">
                <td className="px-4 py-2">
                  {new Date(wo.dateOpened).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/work-orders/${wo.id}`}
                    className="text-accent-ink hover:underline"
                  >
                    {wo.customer.firstName} {wo.customer.lastName}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {wo.vehicle.year ?? ""} {wo.vehicle.make} {wo.vehicle.model}
                </td>
                <td className="px-4 py-2">{wo.description}</td>
                <td className="px-4 py-2">
                  <WorkOrderStatusBadge status={wo.status} />
                </td>
              </tr>
            ))}
            {workOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No work orders yet.{" "}
                  <Link href="/work-orders/new" className="text-accent-ink hover:underline">
                    Create one
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
