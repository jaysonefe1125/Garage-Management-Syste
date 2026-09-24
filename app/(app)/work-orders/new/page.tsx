import { prisma } from "@/lib/db";
import { NewWorkOrderForm } from "@/components/work-orders/NewWorkOrderForm";
import { pageTitleClass } from "@/components/ui/styles";

export default async function NewWorkOrderPage() {
  const customers = await prisma.customer.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { vehicleLinks: { include: { vehicle: true } } },
  });

  return (
    <div className="max-w-xl">
      <h1 className={pageTitleClass}>New Work Order</h1>
      <div className="mt-4">
        <NewWorkOrderForm customers={customers} />
      </div>
    </div>
  );
}
