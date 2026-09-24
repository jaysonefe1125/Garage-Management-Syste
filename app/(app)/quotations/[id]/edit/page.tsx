import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateQuotation } from "@/lib/actions/quotations";
import { inputClass, labelClass, primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quotationId = parseInt(id, 10);
  const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!quotation) notFound();

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>Edit Quotation</h1>
      <form
        action={updateQuotation.bind(null, quotation.id)}
        className="mt-4 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input
              name="clientName"
              defaultValue={quotation.clientName}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Number (optional)</label>
            <input
              name="clientContact"
              defaultValue={quotation.clientContact ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Vehicle</label>
          <input
            name="vehicleDescription"
            defaultValue={quotation.vehicleDescription}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>What does the customer need?</label>
          <textarea
            name="requestDescription"
            rows={3}
            defaultValue={quotation.requestDescription}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={quotation.notes ?? ""}
            className={inputClass}
          />
        </div>

        <button type="submit" className={primaryButtonClass}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
