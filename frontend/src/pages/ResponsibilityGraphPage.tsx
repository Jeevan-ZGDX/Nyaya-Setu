import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { getCase } from "@/data/cases";
import { ResponsibilityGraph } from "@/components/nyaya/ResponsibilityGraph";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResponsibilityGraphPage() {
  const { id } = useParams();
  const c = getCase(id || "");
  const [active, setActive] = useState<string | undefined>();
  const node = c.graph.nodes.find(n => n.id === active);

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <div className="flex items-center gap-3 mb-5">
        <Link to={`/workspace/${c.id}`} className="h-9 w-9 grid place-items-center rounded-lg surface-glass">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="text-[11px] font-mono text-muted-foreground">{c.id}</div>
          <h1 className="font-display text-2xl font-semibold">Responsibility Graph</h1>
        </div>
      </div>

      <ResponsibilityGraph c={c} activeId={active} onSelect={setActive} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 mt-6">
        <div className="surface-glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Timeline</div>
          <ol className="relative pl-6 space-y-4">
            <span className="absolute left-2 top-1.5 bottom-1.5 w-px bg-border-strong" />
            {[
              { icon: CheckCircle2, tone: "text-success", title: "Order received", time: "03 Sep 2024 · 11:42" },
              { icon: CheckCircle2, tone: "text-success", title: "AI extraction complete", time: "03 Sep 2024 · 11:46" },
              { icon: AlertTriangle, tone: "text-warning", title: "Forwarded to SDO Thane", time: "04 Sep 2024 · 09:10" },
              { icon: Clock, tone: "text-primary-glow", title: "Awaiting officer action", time: "Now" },
            ].map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-surface border border-border-strong grid place-items-center">
                  <t.icon className={`h-2.5 w-2.5 ${t.tone}`} />
                </span>
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{t.time}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-glass rounded-2xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Selected Node</div>
          {node ? (
            <div className="animate-fade-in">
              <div className="font-display text-2xl font-semibold">{node.label}</div>
              {node.sub && <div className="text-sm text-muted-foreground mt-1">{node.sub}</div>}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border-strong px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                {node.kind}
              </div>
              {node.state === "delayed" && (
                <div className="mt-4 rounded-lg border border-critical/40 bg-critical/10 p-3 text-xs text-critical">
                  ⚠ This node is delayed. Last activity logged 6 days ago — escalation recommended.
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">Click any node to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
}
