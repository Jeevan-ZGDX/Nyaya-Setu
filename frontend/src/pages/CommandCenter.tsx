import { Link } from "react-router-dom";
import { useState } from "react";
import { cases, stages } from "@/data/cases";
import { PipelineTrack } from "@/components/nyaya/PipelineTrack";
import { StatusTag } from "@/components/nyaya/StatusTag";
import { RiskDot } from "@/components/nyaya/RiskDot";
import { DeadlineCountdown } from "@/components/nyaya/DeadlineCountdown";
import { ConfidenceRing } from "@/components/nyaya/ConfidenceRing";
import { FileUpload } from "@/components/nyaya/FileUpload";
import { ArrowRight, Activity, ClipboardCheck, AlertOctagon, CheckCircle2, GitBranch, LayoutGrid, ShieldCheck } from "lucide-react";

const kpis = [
  { label: "Active Cases", value: cases.filter(c => c.status !== "completed").length, icon: Activity, tone: "text-primary-glow" },
  { label: "Awaiting Review", value: cases.filter(c => c.status === "needs_review").length, icon: ClipboardCheck, tone: "text-warning" },
  { label: "Critical Deadlines", value: cases.filter(c => c.urgency === "critical").length, icon: AlertOctagon, tone: "text-critical" },
  { label: "Completed Today", value: cases.filter(c => c.status === "completed").length, icon: CheckCircle2, tone: "text-success" },
];

export default function CommandCenter() {
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const featured = cases.filter(c => c.status === "needs_review").slice(0, 3);
  const liveStrip = cases.filter(c => c.status === "processing").slice(0, 5);

  return (
    <div className="relative">
      <div className="absolute inset-x-0 -top-8 h-72 bg-gradient-glow pointer-events-none" />

      <section className="mx-auto max-w-[1500px] px-6 pt-10 pb-6 relative">
        <div className="flex items-end justify-between flex-wrap gap-4 animate-fade-in">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">{today}</div>
            <h1 className="font-display text-5xl font-semibold tracking-tight">
              Good morning, <span className="text-gradient">Sharma-ji</span>.
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Eight cases are flowing through the AI pipeline. Three need your decision today — one is critical.
            </p>
          </div>
          <Link
            to="/workspace/WP-2024-08712"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary text-primary-foreground px-5 py-3 font-semibold text-sm shadow-elegant hover:shadow-glow transition-shadow"
          >
            Open today's priority case
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 mt-8">
        <FileUpload onUploadSuccess={setUploadedDocId} />
      </section>

      <section className="mx-auto max-w-[1500px] px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {kpis.map((k, i) => (
          <div key={k.label} className="surface-glass rounded-2xl p-5 animate-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.tone}`} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tabular-nums">{k.value}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">cases</span>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[1500px] px-6 mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Live AI Pipeline</h2>
          <Link to="/feed" className="text-xs text-primary-glow hover:underline">View full feed →</Link>
        </div>
        <div className="surface-glass rounded-2xl p-6">
          <PipelineTrack current="reasoning" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {liveStrip.map(c => (
              <Link key={c.id} to={`/workspace/${c.id}`} className="rounded-xl border border-border bg-surface/60 p-3 hover:border-primary/50 transition-all hover:-translate-y-0.5">
                <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                <div className="text-xs font-medium mt-1 line-clamp-1">{c.title}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wider text-primary-glow">
                  → {stages.find(s => s.key === c.stage)?.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold">Needs your decision</h2>
          <Link to="/dashboard" className="text-xs text-primary-glow hover:underline">All decisions →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {featured.map((c, i) => {
            const top = c.decisions[0];
            return (
              <Link
                key={c.id}
                to={`/workspace/${c.id}`}
                className="group rounded-2xl border border-border bg-gradient-surface p-5 hover:border-primary/60 hover:shadow-glow transition-all animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                    <StatusTag status={c.status} className="mt-2" />
                  </div>
                  <ConfidenceRing value={top.confidence} size={48} stroke={4} />
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight mb-1">{top.action}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{c.title}</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <RiskDot risk={c.urgency} withLabel />
                  <DeadlineCountdown deadline={top.deadline} compact />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-6 mt-10 mb-16">
        <h2 className="font-display text-xl font-semibold mb-3">Drill in</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: "/dashboard", icon: LayoutGrid, title: "Decision Dashboard", desc: "All cases across departments, filterable by urgency and action type." },
            { to: "/verify/WP-2024-08712", icon: ShieldCheck, title: "Human Verification", desc: "Approve or correct AI-extracted fields with source tracing." },
            { to: "/graph/WP-2024-08712", icon: GitBranch, title: "Responsibility Graph", desc: "Trace court order → department → officer → action." },
          ].map((t, i) => (
            <Link key={t.to} to={t.to} className="group surface-glass rounded-2xl p-5 hover:border-primary/40 transition-all animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center mb-3 group-hover:bg-primary/20 transition-colors">
                <t.icon className="h-4 w-4 text-primary-glow" />
              </div>
              <div className="font-display text-lg font-semibold">{t.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-3 text-xs text-primary-glow inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Enter <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
