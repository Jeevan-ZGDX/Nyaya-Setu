import { cn } from "@/lib/utils";
import type { Risk } from "@/data/cases";

const map: Record<Risk, { color: string; label: string }> = {
  low: { color: "bg-success", label: "Low" },
  medium: { color: "bg-primary-glow", label: "Medium" },
  high: { color: "bg-warning", label: "High" },
  critical: { color: "bg-critical", label: "Critical" },
};

export function RiskDot({ risk, withLabel = false, className }: { risk: Risk; withLabel?: boolean; className?: string }) {
  const m = map[risk];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("relative h-2.5 w-2.5 rounded-full", m.color)}>
        {(risk === "critical" || risk === "high") && (
          <span className={cn("absolute inset-0 rounded-full animate-ping opacity-60", m.color)} />
        )}
      </span>
      {withLabel && <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>}
    </span>
  );
}
