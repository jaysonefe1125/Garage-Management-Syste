import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateWorkOrder } from "@/lib/actions/workOrders";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function EditWorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrderId = parseInt(id, 10);
  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: { customer: true, vehicle: true },
  });
  if (!workOrder) notFound();

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>Edit Work Order</h1>
      <p className="mt-1 text-sm text-muted">
        {workOrder.customer.firstName} {workOrder.customer.lastName} —{" "}
        {workOrder.vehicle.year ?? ""} {workOrder.vehicle.make} {workOrder.vehicle.model}
      </p>

      <form
        action={updateWorkOrder.bind(null, workOrder.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div>
          <label className={labelClass}>Description / Diagnosis</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={workOrder.description}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mileage In</label>
            <input
              name="mileageIn"
              type="number"
              min="0"
              defaultValue={workOrder.mileageIn ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mileage Out</label>
            <input
              name="mileageOut"
              type="number"
              min="0"
              defaultValue={workOrder.mileageOut ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
