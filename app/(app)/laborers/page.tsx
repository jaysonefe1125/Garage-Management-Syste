import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorkOrderStatus } from "@prisma/client";
import { primaryButtonClass, pageTitleClass } from "@/components/ui/styles";
import { Badge } from "@/components/ui/Badge";

const OPEN_STATUSES: WorkOrderStatus[] = [
  "INTAKE",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "COMPLETED",
];

export default async function LaborersPage() {
  const laborers = await prisma.laborer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      laborItems: {
        where: { workOrder: { status: { in: OPEN_STATUSES } } },
        select: { workOrderId: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Laborers</h1>
        <Link href="/laborers/new" className={primaryButtonClass}>
          + New Laborer
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-muted">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Open Orders</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {laborers.map((l) => {
              const openOrderCount = new Set(l.laborItems.map((i) => i.workOrderId)).size;
              return (
                <tr key={l.id} className="border-t border-line hover:bg-ink/[0.03]">
                  <td className="px-4 py-2">{l.name}</td>
                  <td className="px-4 py-2">{l.role}</td>
                  <td className="px-4 py-2">{l.phone ?? "—"}</td>
                  <td className="px-4 py-2">
                    {openOrderCount > 0 ? (
                      <Badge tone="accent">{openOrderCount}</Badge>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/laborers/${l.id}/edit`}
                      className="text-xs text-accent-ink hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {laborers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No laborers yet.{" "}
                  <Link href="/laborers/new" className="text-accent-ink hover:underline">
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
