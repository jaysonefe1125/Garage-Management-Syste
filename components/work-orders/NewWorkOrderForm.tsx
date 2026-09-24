"use client";

import { useState } from "react";
import { createWorkOrder } from "@/lib/actions/workOrders";
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

export function NewWorkOrderForm({
  customers,
}: {
  customers: CustomerWithVehicles[];
}) {
  const [customerId, setCustomerId] = useState("");

  const selectedCustomer = customers.find((c) => String(c.id) === customerId);
  const vehicles = selectedCustomer?.vehicleLinks.map((l) => l.vehicle) ?? [];

  return (
    <form
      action={createWorkOrder}
      className="space-y-4 rounded-lg border border-line bg-panel p-6"
    >
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

      <div>
        <label className={labelClass}>Mileage In</label>
        <input name="mileageIn" type="number" min="0" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Description / Diagnosis</label>
        <textarea name="description" rows={3} required className={inputClass} />
      </div>

      <button type="submit" className={primaryButtonClass}>
        Create Work Order
      </button>
    </form>
  );
}
