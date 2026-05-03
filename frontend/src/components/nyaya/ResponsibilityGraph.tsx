import type { CourtCase } from "@/data/cases";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const kindMeta: Record<string, { color: string; ring: string }> = {
  court: { color: "bg-primary/15 text-primary-glow", ring: "ring-primary/40" },
  department: { color: "bg-accent/15 text-accent", ring: "ring-accent/40" },
  officer: { color: "bg-warning/15 text-warning", ring: "ring-warning/40" },
  action: { color: "bg-primary/15 text-primary-glow", ring: "ring-primary/40" },
  status: { color: "bg-success/15 text-success", ring: "ring-success/40" },
};

export function ResponsibilityGraph({ c, activeId, onSelect }: { c: CourtCase; activeId?: string; onSelect?: (id: string) => void }) {
  const W = 1000;
  const H = 320;
  const positions = useMemo(() => {
    const n = c.graph.nodes.length;
    const padX = 120;
    const step = (W - padX * 2) / Math.max(1, n - 1);
    return c.graph.nodes.map((node, i) => ({
      ...node,
      x: padX + step * i,
      y: H / 2 + (i % 2 === 0 ? -28 : 28),
    }));
  }, [c.graph.nodes]);

  const posMap = new Map(positions.map((p) => [p.id, p]));

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="grid-backdrop">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[320px]">
          <defs>
            <linearGradient id="edge-ok" x1="0" x2="1">
              <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="edge-delayed" x1="0" x2="1">
              <stop offset="0" stopColor="hsl(var(--warning))" stopOpacity="0.7" />
              <stop offset="1" stopColor="hsl(var(--critical))" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>

          {c.graph.edges.map((e, i) => {
            const a = posMap.get(e.from);
            const b = posMap.get(e.to);
            if (!a || !b) return null;
            const mx = (a.x + b.x) / 2;
            const path = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
            const isDelayed = e.state === "delayed";
            const isActive = e.state === "active" || e.state === "delayed";
            return (
              <g key={i}>
                <path d={path} stroke={isDelayed ? "url(#edge-delayed)" : "url(#edge-ok)"} strokeWidth="2" fill="none" opacity="0.9" />
                {isActive && (
                  <path
                    d={path}
                    stroke={isDelayed ? "hsl(var(--critical))" : "hsl(var(--primary-glow))"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6 6"
                    className="animate-dash-flow"
                    opacity="0.85"
                  />
                )}
              </g>
            );
          })}

          {positions.map((p) => {
            const m = kindMeta[p.kind];
            const active = activeId === p.id;
            const w = Math.max(120, p.label.length * 8 + 32);
            return (
              <g key={p.id} transform={`translate(${p.x - w / 2}, ${p.y - 24})`} className="cursor-pointer" onClick={() => onSelect?.(p.id)}>
                {active && <rect width={w} height={48} rx={14} className="fill-primary/20" filter="url(#glow)" />}
                <rect
                  width={w}
                  height={48}
                  rx={14}
                  className={cn("stroke-2 transition-all", active ? "fill-surface-elevated stroke-primary" : "fill-surface stroke-border-strong")}
                />
                <text x={w / 2} y={20} textAnchor="middle" className="fill-foreground text-[12px] font-semibold font-sans">{p.label}</text>
                {p.sub && (
                  <text x={w / 2} y={36} textAnchor="middle" className="fill-muted-foreground text-[10px] font-sans">{p.sub}</text>
                )}
                <text x={-4} y={-6} textAnchor="end" className={cn("text-[8px] uppercase font-bold tracking-widest font-sans", m.color.includes("primary") && "fill-primary-glow", m.color.includes("accent") && "fill-accent", m.color.includes("warning") && "fill-warning", m.color.includes("success") && "fill-success")}>
                  {p.kind}
                </text>
                {p.state === "delayed" && (
                  <circle cx={w - 10} cy={10} r={5} className="fill-critical">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
