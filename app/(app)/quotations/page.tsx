import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { primaryButtonClass, pageTitleClass } from "@/components/ui/styles";
import { Badge } from "@/components/ui/Badge";

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { laborItems: true, partItems: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitleClass}>Quotations</h1>
        <Link href="/quotations/new" className={primaryButtonClass}>
          + New Quotation
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-sm">
          <thead className="bg-ink/[0.03] text-left text-muted">
            <tr>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => {
              const total =
                q.laborItems.reduce((sum, i) => sum + i.amountCents, 0) +
                q.partItems.reduce((sum, i) => sum + i.totalCents, 0);
              return (
                <tr key={q.id} className="border-t border-line hover:bg-ink/[0.03]">
                  <td className="px-4 py-2">
                    <Link
                      href={`/quotations/${q.id}`}
                      className="text-accent-ink hover:underline"
                    >
                      {q.clientName}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{q.vehicleDescription}</td>
                  <td className="px-4 py-2">{formatCents(total)}</td>
                  <td className="px-4 py-2">
                    {q.status === "CONVERTED" ? (
                      <Link
                        href={`/work-orders/${q.convertedWorkOrderId}`}
                        className="hover:underline"
                      >
                        <Badge tone="olive">
                          Converted → WO #{q.convertedWorkOrderId}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge tone="muted">Pending</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No quotations yet.{" "}
                  <Link href="/quotations/new" className="text-accent-ink hover:underline">
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
