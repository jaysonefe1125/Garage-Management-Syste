const STEPS = [
  { value: "INTAKE", label: "Intake" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_ON_PARTS", label: "Waiting on Parts" },
  { value: "COMPLETED", label: "Completed" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "CLOSED", label: "Closed" },
];

export function StatusStepper({ current }: { current: string }) {
  const currentIndex = STEPS.findIndex((s) => s.value === current);

  return (
    <div className="flex items-center overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.value} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                  active
                    ? "bg-accent text-white"
                    : done
                      ? "bg-olive text-white"
                      : "bg-line text-muted"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`mt-1 whitespace-nowrap text-xs ${
                  active ? "font-semibold text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px w-8 shrink-0 ${done ? "bg-olive" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
