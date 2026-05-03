import { ConfidenceRing } from "./ConfidenceRing";
import { RiskDot } from "./RiskDot";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { ChevronRight, Sparkles, AlertTriangle } from "lucide-react";
import type { DecisionAction } from "@/data/cases";
import { cn } from "@/lib/utils";

interface Props {
  decision: DecisionAction;
  onSourceClick?: (highlightId: string) => void;
  onApprove?: () => void;
  active?: boolean;
}

export function DecisionCard({ decision, onSourceClick, onApprove, active }: Props) {
  const lowConf = decision.confidence < 80;

  return (
    <article
      className={cn(
        "group relative rounded-2xl border bg-gradient-surface p-5 shadow-card transition-all",
        "hover:border-border-strong hover:-translate-y-0.5 hover:shadow-elegant",
        active ? "border-primary/60 shadow-glow" : "border-border",
        "animate-scale-in"
      )}
    >
      {lowConf && (
        <div className="absolute -top-2.5 left-5 inline-flex items-center gap-1 bg-warning/20 border border-warning/40 text-warning rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider">
          <AlertTriangle className="h-3 w-3" /> Low confidence · expanded
        </div>
      )}

      <header className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <RiskDot risk={decision.risk} withLabel />
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight">{decision.action}</h3>
        </div>
        <ConfidenceRing value={decision.confidence} />
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface/60 border border-border px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Deadline</div>
          <DeadlineCountdown deadline={decision.deadline} compact />
        </div>
        <button
          onClick={() => decision.sourceHighlightId && onSourceClick?.(decision.sourceHighlightId)}
          className="rounded-lg bg-surface/60 border border-border px-3 py-2 text-left hover:border-primary/50 transition-colors"
        >
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Source</div>
          <div className="text-xs font-medium text-primary-glow flex items-center gap-1">
            View in PDF <ChevronRight className="h-3 w-3" />
          </div>
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-surface/40 border border-border p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
          <Sparkles className="h-3 w-3 text-primary-glow" /> AI Reasoning
        </div>
        <p className="text-xs leading-relaxed text-foreground/85">{decision.reasoning}</p>
      </div>

      {lowConf && decision.alternatives && decision.alternatives.length > 0 && (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-3 animate-fade-in">
          <div className="text-[10px] uppercase tracking-widest text-warning mb-1.5">Alternative Interpretations</div>
          <ul className="space-y-1.5">
            {decision.alternatives.map((a, i) => (
              <li key={i} className="text-xs text-foreground/80 flex gap-2">
                <span className="text-warning font-mono mt-px">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="mt-4 flex items-center gap-2">
        <button
          onClick={onApprove}
          className="flex-1 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider py-2.5 hover:shadow-glow transition-shadow"
        >
          Approve & Dispatch
        </button>
        <button className="rounded-lg border border-border-strong text-xs font-medium px-3 py-2.5 hover:bg-surface-elevated transition-colors">
          Edit
        </button>
      </footer>
    </article>
  );
}
