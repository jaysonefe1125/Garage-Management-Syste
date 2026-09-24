import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/money";
import {
  addLaborItem,
  addPartItem,
  deleteLaborItem,
  deletePartItem,
  deleteWorkOrder,
  updateWorkOrderStatus,
} from "@/lib/actions/workOrders";
import { StatusStepper } from "@/components/work-orders/StatusStepper";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
  sectionTitleClass,
} from "@/components/ui/styles";

const STATUS_OPTIONS = [
  "INTAKE",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "COMPLETED",
  "INVOICED",
  "CLOSED",
];

const LOCKED_STATUSES = ["INVOICED", "CLOSED"];

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrderId = parseInt(id, 10);

  const [workOrder, activeInventory, activeLaborers] = await Promise.all([
    prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        customer: true,
        vehicle: true,
        laborItems: { orderBy: { sortOrder: "asc" }, include: { laborer: true } },
        partItems: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.inventoryItem.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.laborer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!workOrder) notFound();

  const editable = !LOCKED_STATUSES.includes(workOrder.status);
  const laborTotal = workOrder.laborItems.reduce((sum, i) => sum + i.totalCents, 0);
  const partsTotal = workOrder.partItems.reduce((sum, i) => sum + i.totalCents, 0);
  const grandTotal = laborTotal + partsTotal;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={pageTitleClass}>
            {workOrder.customer.firstName} {workOrder.customer.lastName} —{" "}
            {workOrder.vehicle.year ?? ""} {workOrder.vehicle.make}{" "}
            {workOrder.vehicle.model}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Opened {new Date(workOrder.dateOpened).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/work-orders/${workOrder.id}/estimate`} className={secondaryButtonClass}>
            Preview Estimate
          </Link>
          <Link href={`/work-orders/${workOrder.id}/invoice`} className={secondaryButtonClass}>
            Preview Invoice
          </Link>
          <Link href={`/work-orders/${workOrder.id}/edit`} className={secondaryButtonClass}>
            Edit
          </Link>
          {editable && (
            <form action={deleteWorkOrder.bind(null, workOrder.id)}>
              <button type="submit" className={dangerButtonClass}>
                Delete
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-line bg-panel p-4 text-sm">
        <div className="col-span-2">
          <span className="text-muted">Description:</span> {workOrder.description}
        </div>
        <div>
          <span className="text-muted">Mileage In:</span>{" "}
          {workOrder.mileageIn ?? "—"}
        </div>
        <div>
          <span className="text-muted">Mileage Out:</span>{" "}
          {workOrder.mileageOut ?? "—"}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-panel p-4">
        <StatusStepper current={workOrder.status} />
        <form
          action={updateWorkOrderStatus.bind(null, workOrder.id)}
          className="mt-3 flex items-end gap-3"
        >
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={workOrder.status} className={inputClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={secondaryButtonClass}>
            Update Status
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Labor</h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-muted">
              <tr>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Laborer</th>
                <th className="px-4 py-2">Amount</th>
                {editable && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {workOrder.laborItems.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">
                    {item.laborer.name}
                    <span className="ml-1 text-xs text-muted">
                      ({item.laborer.role})
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatCents(item.totalCents)}</td>
                  {editable && (
                    <td className="px-4 py-2 text-right">
                      <form action={deleteLaborItem.bind(null, item.id, workOrder.id)}>
                        <button
                          type="submit"
                          className="text-xs text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {workOrder.laborItems.length === 0 && (
                <tr>
                  <td
                    colSpan={editable ? 4 : 3}
                    className="px-4 py-4 text-center text-muted"
                  >
                    No labor items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editable && (
          <form
            key={workOrder.laborItems.length}
            action={addLaborItem.bind(null, workOrder.id)}
            className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4"
          >
            <div className="flex-1">
              <label className={labelClass}>Description</label>
              <input name="description" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Laborer</label>
              <select name="laborerId" required className={inputClass}>
                <option value="">Select…</option>
                {activeLaborers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Amount (₱)</label>
              <input
                name="amountDollars"
                type="number"
                step="0.01"
                min="0"
                required
                className={inputClass}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Add Labor
            </button>
          </form>
        )}
      </div>

      <div className="mt-6">
        <h2 className={sectionTitleClass}>Parts</h2>
        <div className="mt-2 overflow-hidden rounded-lg border border-line bg-panel">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-muted">
              <tr>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Unit Price</th>
                <th className="px-4 py-2">Total</th>
                {editable && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {workOrder.partItems.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{formatCents(item.unitPriceCents)}</td>
                  <td className="px-4 py-2">{formatCents(item.totalCents)}</td>
                  {editable && (
                    <td className="px-4 py-2 text-right">
                      <form action={deletePartItem.bind(null, item.id, workOrder.id)}>
                        <button
                          type="submit"
                          className="text-xs text-danger hover:underline"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {workOrder.partItems.length === 0 && (
                <tr>
                  <td
                    colSpan={editable ? 5 : 4}
                    className="px-4 py-4 text-center text-muted"
                  >
                    No parts used yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editable && (
          <form
            key={workOrder.partItems.length}
            action={addPartItem.bind(null, workOrder.id)}
            className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-panel p-4"
          >
            <div className="flex-1">
              <label className={labelClass}>Part</label>
              <select name="inventoryItemId" required className={inputClass}>
                <option value="">Select a part…</option>
                {activeInventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} — {formatCents(inv.sellPriceCents)} ({inv.quantityOnHand} on
                    hand)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                required
                className={inputClass}
              />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Add Part
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-64 rounded-lg border border-line bg-panel p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Labor Total</span>
            <span>{formatCents(laborTotal)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">Parts Total</span>
            <span>{formatCents(partsTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
            <span>Grand Total</span>
            <span>{formatCents(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
