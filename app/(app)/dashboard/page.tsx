import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorkOrderStatus } from "@prisma/client";
import {
  primaryButtonClass,
  secondaryButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

const STATUS_LABELS: Record<string, string> = {
  INTAKE: "Intake",
  IN_PROGRESS: "In Progress",
  WAITING_ON_PARTS: "Waiting on Parts",
  COMPLETED: "Completed",
  INVOICED: "Invoiced",
  CLOSED: "Closed",
};

const OPEN_STATUSES: WorkOrderStatus[] = [
  "INTAKE",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "COMPLETED",
  "INVOICED",
];

export default async function DashboardPage() {
  const [statusCounts, lowStockItems, customerCount, vehicleCount] = await Promise.all([
    prisma.workOrder.groupBy({
      by: ["status"],
      _count: true,
      where: { status: { in: OPEN_STATUSES } },
    }),
    prisma.inventoryItem.findMany({
      where: { active: true },
    }),
    prisma.customer.count(),
    prisma.vehicle.count(),
  ]);

  const lowStock = lowStockItems.filter(
    (item) => item.quantityOnHand <= item.reorderThreshold
  );

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );
  const totalOpen = statusCounts.reduce((sum, s) => sum + s._count, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/customers/new" className={secondaryButtonClass}>
            + New Customer
          </Link>
          <Link href="/work-orders/new" className={primaryButtonClass}>
            + New Work Order
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="font-display text-3xl text-ink">{totalOpen}</div>
          <div className="text-sm text-muted">Open Work Orders</div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="font-display text-3xl text-ink">{customerCount}</div>
          <div className="text-sm text-muted">Customers</div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-4">
          <div className="font-display text-3xl text-ink">{vehicleCount}</div>
          <div className="text-sm text-muted">Vehicles</div>
        </div>
        <div
          className={`rounded-lg border p-4 ${
            lowStock.length > 0
              ? "border-danger/30 bg-danger-bg"
              : "border-line bg-panel"
          }`}
        >
          <div
            className={`font-display text-3xl ${lowStock.length > 0 ? "text-danger" : "text-ink"}`}
          >
            {lowStock.length}
          </div>
          <div className="text-sm text-muted">Low Stock Items</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className={sectionTitleClass}>Open Work Orders by Status</h2>
          <div className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
            {OPEN_STATUSES.map((status) => (
              <div key={status} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{STATUS_LABELS[status]}</span>
                <span className="font-medium text-ink">{countByStatus[status] ?? 0}</span>
              </div>
            ))}
          </div>
          <Link
            href="/work-orders"
            className="mt-2 inline-block text-sm text-accent-ink hover:underline"
          >
            View all work orders →
          </Link>
        </div>

        <div>
          <h2 className={sectionTitleClass}>Low Stock Items</h2>
          <div className="mt-2 divide-y divide-line rounded-lg border border-line bg-panel">
            {lowStock.map((item) => (
              <Link
                key={item.id}
                href={`/inventory/${item.id}`}
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-ink/[0.03]"
              >
                <span>{item.name}</span>
                <span className="text-danger">
                  {item.quantityOnHand} on hand (reorder at {item.reorderThreshold})
                </span>
              </Link>
            ))}
            {lowStock.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-muted">
                No low-stock items.
              </div>
            )}
          </div>
          <Link
            href="/inventory"
            className="mt-2 inline-block text-sm text-accent-ink hover:underline"
          >
            View all inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}
