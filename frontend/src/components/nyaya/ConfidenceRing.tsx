import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceRing({ value, size = 56, stroke = 5, className, showLabel = true }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const tone =
    value >= 85 ? "hsl(var(--success))" : value >= 70 ? "hsl(var(--primary-glow))" : "hsl(var(--warning))";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border-strong))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground -mt-0.5">conf</span>
        </div>
      )}
    </div>
  );
}
