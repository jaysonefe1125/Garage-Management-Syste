"use client";

import { useState } from "react";
import { convertQuotationToWorkOrder } from "@/lib/actions/quotations";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui/styles";

interface CustomerWithVehicles {
  id: number;
  firstName: string;
  lastName: string;
  vehicleLinks: {
    vehicle: {
      id: number;
      make: string;
      model: string;
      year: number | null;
      plate: string | null;
    };
  }[];
}

export function ConvertToWorkOrderForm({
  quotationId,
  customers,
}: {
  quotationId: number;
  customers: CustomerWithVehicles[];
}) {
  const [customerId, setCustomerId] = useState("");

  const selectedCustomer = customers.find((c) => String(c.id) === customerId);
  const vehicles = selectedCustomer?.vehicleLinks.map((l) => l.vehicle) ?? [];

  return (
    <form
      action={convertQuotationToWorkOrder.bind(null, quotationId)}
      className="space-y-4 rounded-lg border border-line bg-panel p-4"
    >
      <p className="text-sm text-muted">
        Pick the customer and vehicle for this job. If they aren&apos;t in the system yet,
        create them first from the Customers page, then come back here.
      </p>

      <div>
        <label className={labelClass}>Customer</label>
        <select
          name="customerId"
          required
          className={inputClass}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select a customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Vehicle</label>
        <select name="vehicleId" required className={inputClass} disabled={!customerId}>
          <option value="">
            {customerId ? "Select a vehicle…" : "Select a customer first"}
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year ?? ""} {v.make} {v.model} {v.plate ? `(${v.plate})` : ""}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={primaryButtonClass}>
        Convert to Work Order
      </button>
    </form>
  );
}
