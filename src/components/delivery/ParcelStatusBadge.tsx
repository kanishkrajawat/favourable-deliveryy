import { cn } from "@/lib/utils";
import type { ParcelStage } from "@/lib/delivery-data";

const TONE: Record<ParcelStage, string> = {
  held: "border-hub/30 bg-hub-soft text-hub-deep",
  assigned: "border-route/30 bg-route-soft text-route-deep",
  delivered: "border-route/30 bg-route-soft text-route-deep",
};

const SHORT: Record<ParcelStage, string> = {
  held: "Held at hub",
  assigned: "Assigned to rider",
  delivered: "Delivered",
};

export function ParcelStatusBadge({
  stage,
  label,
  className,
}: {
  stage: ParcelStage;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] mono",
        TONE[stage],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          stage === "held" ? "bg-hub" : "bg-route",
        )}
      />
      {label ?? SHORT[stage]}
    </span>
  );
}
