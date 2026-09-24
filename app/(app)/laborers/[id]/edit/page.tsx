import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateLaborer, deactivateLaborer } from "@/lib/actions/laborers";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  dangerButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

const ROLE_SUGGESTIONS = ["Painter", "Mechanic", "Car Washer", "Detailer"];

export default async function EditLaborerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const laborerId = parseInt(id, 10);
  const laborer = await prisma.laborer.findUnique({ where: { id: laborerId } });
  if (!laborer) notFound();

  return (
    <div className="max-w-md">
      <h1 className={pageTitleClass}>Edit Laborer</h1>
      <form
        action={updateLaborer.bind(null, laborer.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div>
          <label className={labelClass}>Name</label>
          <input
            name="name"
            defaultValue={laborer.name}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Role</label>
          <input
            name="role"
            defaultValue={laborer.role}
            required
            list="role-suggestions"
            className={inputClass}
          />
          <datalist id="role-suggestions">
            {ROLE_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input name="phone" defaultValue={laborer.phone ?? ""} className={inputClass} />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>

      <form action={deactivateLaborer.bind(null, laborer.id)} className="mt-3">
        <button type="submit" className={dangerButtonClass}>
          Deactivate Laborer
        </button>
      </form>
    </div>
  );
}
