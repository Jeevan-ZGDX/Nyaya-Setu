import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

export function DeadlineCountdown({ deadline, compact = false, className }: { deadline: string; compact?: boolean; className?: string }) {
  const c = useCountdown(deadline);

  if (c.invalid) {
    return (
      <span className={cn("font-mono text-xs text-muted-foreground", className)}>{deadline}</span>
    );
  }

  const tone = c.overdue
    ? "text-critical"
    : c.days < 3
    ? "text-warning"
    : c.days < 14
    ? "text-primary-glow"
    : "text-muted-foreground";

  if (compact) {
    return (
      <span className={cn("font-mono text-xs", tone, className)}>
        {c.overdue ? "−" : ""}{c.days}d {String(c.hours).padStart(2, "0")}h
      </span>
    );
  }
  return (
    <div className={cn("flex items-baseline gap-1.5 font-mono", tone, className)}>
      <span className="text-2xl font-semibold tabular-nums">{c.days}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-70">d</span>
      <span className="text-2xl font-semibold tabular-nums">{String(c.hours).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-70">h</span>
      <span className="text-2xl font-semibold tabular-nums">{String(c.minutes).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-70">m</span>
      <span className="text-base font-semibold tabular-nums opacity-70 animate-tick">{String(c.seconds).padStart(2, "0")}</span>
      {c.overdue && <span className="ml-2 text-[10px] uppercase tracking-widest text-critical font-sans">overdue</span>}
    </div>
  );
}
