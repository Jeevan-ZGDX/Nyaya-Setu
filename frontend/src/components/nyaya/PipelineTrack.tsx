import { cn } from "@/lib/utils";
import { stages, type PipelineStage } from "@/data/cases";
import { ScanLine, FileSearch, Brain, ListChecks } from "lucide-react";

const icons: Record<PipelineStage, typeof ScanLine> = {
  ocr: ScanLine,
  extraction: FileSearch,
  reasoning: Brain,
  action_plan: ListChecks,
};

interface Props {
  current: PipelineStage;
  progress?: number; // 0-100 within current stage
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PipelineTrack({ current, size = "md", className }: Props) {
  const currentIdx = stages.findIndex((s) => s.key === current);
  const dim = size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-7 w-7";

  return (
    <div className={cn("flex items-center w-full", className)}>
      {stages.map((s, i) => {
        const Icon = icons[s.key];
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "rounded-full grid place-items-center border transition-all",
                  dim,
                  done && "bg-success/15 border-success/40 text-success",
                  active && "bg-primary/20 border-primary text-primary-glow animate-pulse-glow",
                  !done && !active && "bg-surface border-border text-muted-foreground"
                )}
              >
                <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
              </div>
              {size !== "sm" && (
                <span className={cn("text-[10px] uppercase tracking-wider font-medium", active ? "text-primary-glow" : "text-muted-foreground")}>
                  {s.label}
                </span>
              )}
            </div>
            {i < stages.length - 1 && (
              <div className="relative flex-1 mx-2 h-px bg-border-strong overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-glow",
                    done ? "w-full" : active ? "w-1/2" : "w-0"
                  )}
                  style={{ transition: "width 0.6s ease" }}
                />
                {active && (
                  <div className="absolute inset-y-0 -left-10 w-10 bg-gradient-to-r from-transparent via-primary-glow/70 to-transparent animate-shimmer" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
