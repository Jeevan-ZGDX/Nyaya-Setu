import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { getCase, type ExtractedField } from "@/data/cases";
import { Check, X, Pencil, Save, ArrowLeft, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function ConfidenceBar({ v }: { v: number }) {
  const tone = v >= 90 ? "bg-success" : v >= 75 ? "bg-primary-glow" : "bg-warning";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-border-strong overflow-hidden">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${v}%`, transition: "width 0.5s" }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{v}%</span>
    </div>
  );
}

export default function VerificationPanel() {
  const { id } = useParams();
  const c = getCase(id || "");
  const [editing, setEditing] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(c.fields.map(f => [f.id, f.value])));
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const flash = (hid?: string) => {
    if (!hid) return;
    setHighlighted(hid);
    setTimeout(() => setHighlighted(null), 1800);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <div className="flex items-center gap-3 mb-5">
        <Link to={`/workspace/${c.id}`} className="h-9 w-9 grid place-items-center rounded-lg surface-glass">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="text-[11px] font-mono text-muted-foreground">{c.id}</div>
          <h1 className="font-display text-2xl font-semibold">Human Verification</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <div className="space-y-3">
          {c.fields.map((f: ExtractedField) => {
            const isEditing = editing === f.id;
            const ok = approved[f.id];
            return (
              <div key={f.id} className={cn("rounded-2xl border p-5 transition-all", ok ? "border-success/40 bg-success/5" : "border-border bg-surface/60")}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{f.label}</div>
                    {isEditing ? (
                      <input
                        autoFocus
                        value={values[f.id]}
                        onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                        className="mt-2 w-full bg-surface-elevated border border-primary/40 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="mt-1.5 font-display text-lg font-semibold">{values[f.id]}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {f.sourceHighlightId && (
                      <button
                        onClick={() => flash(f.sourceHighlightId)}
                        className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md text-xs surface-glass hover:border-primary/40"
                      >
                        <Eye className="h-3.5 w-3.5" /> Source
                      </button>
                    )}
                    {!ok && (
                      <button
                        onClick={() => setEditing(isEditing ? null : f.id)}
                        className="h-8 w-8 grid place-items-center rounded-md surface-glass hover:border-primary/40"
                      >
                        {isEditing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">AI Confidence</div>
                  <ConfidenceBar v={f.confidence} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => { setApproved({ ...approved, [f.id]: true }); setEditing(null); toast.success(`"${f.label}" approved`); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg bg-success/15 text-success border border-success/40 py-2 hover:bg-success/25"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => toast.error(`"${f.label}" rejected`)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-border-strong px-3 py-2 hover:bg-surface-elevated"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-2xl border border-border bg-surface overflow-hidden h-[640px] sticky top-20">
          <div className="px-4 py-3 border-b border-border bg-surface-elevated text-xs uppercase tracking-widest text-muted-foreground">Source Document</div>
          <div className="p-5 overflow-auto h-[calc(100%-46px)] scrollbar-thin space-y-3 text-[12px] leading-6 text-foreground/80 font-serif">
            {c.pdfBody.map((p, i) => {
              const has = c.highlights.find(h => h.paragraph === i && h.id === highlighted);
              return (
                <p key={i} className={cn("p-2 rounded-md transition-all", has && "bg-primary/15 ring-1 ring-primary")}>
                  {p}
                </p>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
