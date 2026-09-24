import { prisma } from "@/lib/db";
import { createVehicle } from "@/lib/actions/vehicles";
import { OwnerPicker } from "@/components/vehicles/OwnerPicker";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const preselectedId = customerId ? parseInt(customerId, 10) : undefined;
  const customers = await prisma.customer.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>New Vehicle</h1>
      <form
        action={createVehicle}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Make</label>
            <input name="make" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Model</label>
            <input name="model" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Year</label>
            <input name="year" type="number" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Plate</label>
            <input name="plate" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Color</label>
            <input name="color" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>VIN</label>
            <input name="vin" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mileage</label>
            <input name="mileage" type="number" className={inputClass} />
          </div>
        </div>

        <OwnerPicker
          customers={customers}
          selectedIds={preselectedId ? [preselectedId] : []}
          primaryId={preselectedId}
        />

        <button type="submit" className={primaryButtonClass}>
          Create Vehicle
        </button>
      </form>
    </div>
  );
}
