import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateVehicle } from "@/lib/actions/vehicles";
import { OwnerPicker } from "@/components/vehicles/OwnerPicker";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicleId = parseInt(id, 10);
  const [vehicle, customers] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { ownerLinks: true },
    }),
    prisma.customer.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);
  if (!vehicle) notFound();

  const selectedIds = vehicle.ownerLinks.map((link) => link.customerId);
  const primaryLink = vehicle.ownerLinks.find((link) => link.isPrimary);

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>Edit Vehicle</h1>
      <form
        action={updateVehicle.bind(null, vehicle.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Make</label>
            <input name="make" defaultValue={vehicle.make} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input
              name="model"
              defaultValue={vehicle.model}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Year</label>
            <input
              name="year"
              type="number"
              defaultValue={vehicle.year ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Plate</label>
            <input name="plate" defaultValue={vehicle.plate ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input name="color" defaultValue={vehicle.color ?? ""} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>VIN</label>
            <input name="vin" defaultValue={vehicle.vin ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mileage</label>
            <input
              name="mileage"
              type="number"
              defaultValue={vehicle.mileage ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <OwnerPicker
          customers={customers}
          selectedIds={selectedIds}
          primaryId={primaryLink?.customerId}
        />

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
