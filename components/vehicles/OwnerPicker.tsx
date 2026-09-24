import { labelClass } from "@/components/ui/styles";

interface OwnerPickerProps {
  customers: { id: number; firstName: string; lastName: string }[];
  selectedIds?: number[];
  primaryId?: number;
}

export function OwnerPicker({
  customers,
  selectedIds = [],
  primaryId,
}: OwnerPickerProps) {
  return (
    <div>
      <label className={labelClass}>Owner(s)</label>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-line p-2">
        {customers.map((c) => (
          <div key={c.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="ownerCustomerIds"
              value={c.id}
              defaultChecked={selectedIds.includes(c.id)}
            />
            <span className="flex-1">
              {c.firstName} {c.lastName}
            </span>
            <label className="flex items-center gap-1 text-xs text-muted">
              <input
                type="radio"
                name="primaryOwnerId"
                value={c.id}
                defaultChecked={primaryId === c.id}
              />
              Primary
            </label>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted">
            No customers yet — create one first.
          </p>
        )}
      </div>
    </div>
  );
}
