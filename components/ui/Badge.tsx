const TONE_CLASSES: Record<string, string> = {
  accent: "border-accent/50 text-accent-ink",
  mustard: "border-mustard/50 text-mustard bg-mustard-bg",
  olive: "border-olive/50 text-olive bg-olive-bg",
  rail: "border-rail/40 text-rail",
  muted: "border-line text-muted",
  danger: "border-danger/40 text-danger bg-danger-bg",
};

export type BadgeTone = keyof typeof TONE_CLASSES;

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

const WORK_ORDER_STATUS_TONE: Record<string, BadgeTone> = {
  INTAKE: "muted",
  IN_PROGRESS: "accent",
  WAITING_ON_PARTS: "mustard",
  COMPLETED: "olive",
  INVOICED: "rail",
  CLOSED: "muted",
};

export function WorkOrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={WORK_ORDER_STATUS_TONE[status] ?? "muted"}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
