import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCase } from "@/data/cases";
import { getDocument, type DocumentResponse, type Action as BackendAction } from "@/lib/api";
import { PdfViewerMock } from "@/components/nyaya/PdfViewerMock";
import { DecisionCard } from "@/components/nyaya/DecisionCard";
import { StatusTag } from "@/components/nyaya/StatusTag";
import { ArrowLeft, GitBranch, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { DeadlineCountdown } from "@/components/nyaya/DeadlineCountdown";

const priorityToRisk = (priority: string | undefined) => {
  if (!priority) return "medium";
  const value = priority.toLowerCase();
  if (value.includes("high")) return "critical";
  if (value.includes("medium")) return "medium";
  if (value.includes("low")) return "low";
  return "medium";
};

const normalizeConfidence = (confidence: number) => {
  if (confidence <= 1) return confidence * 100;
  return confidence;
};

export default function ActionWorkspace() {
  const { id } = useParams();
  const staticCase = getCase(id || "");
  const [active, setActive] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<DocumentResponse>({
    queryKey: ["document", id],
    enabled: Boolean(id),
    queryFn: () => getDocument(id || ""),
    staleTime: 1000 * 60,
  });

  const doc = data?.data?.document;
  const actions = data?.data?.actions ?? [];
  const hasBackendData = Boolean(data?.data?.document);

  const displayId = doc?.id ?? staticCase.id;
  const displayTitle = doc?.filename ?? staticCase.title;
  const displayStatus = doc?.status ?? staticCase.status;

  const focusHighlight = (hid: string) => {
    setActive(hid);
    requestAnimationFrame(() => {
      document.getElementById(`hl-${hid}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    setTimeout(() => setActive((cur) => (cur === hid ? null : cur)), 2400);
  };

  const decisionCards = hasBackendData
    ? actions.map((action) => ({
        id: action.id,
        action: action.description ?? "Untitled action",
        reasoning: action.reasoning ?? "No reasoning available.",
        confidence: normalizeConfidence(action.confidence),
        risk: priorityToRisk(action.priority),
        deadline: action.deadline ?? "Not specified",
      }))
    : staticCase.decisions;

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="h-9 w-9 grid place-items-center rounded-lg surface-glass hover:border-primary/40 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span>{displayId}</span><span>·</span><span>{hasBackendData ? "Uploaded Document" : staticCase.court}</span><span>·</span><span>{hasBackendData ? "Backend AI" : staticCase.department}</span>
            </div>
            <h1 className="font-display text-2xl font-semibold leading-tight truncate">{displayTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusTag status={displayStatus} />
          <Link to={`/verify/${displayId}`} className="text-xs surface-glass rounded-lg px-3 py-2 inline-flex items-center gap-1.5 hover:border-primary/40">
            <ShieldCheck className="h-3.5 w-3.5" /> Verify
          </Link>
          <Link to={`/graph/${displayId}`} className="text-xs surface-glass rounded-lg px-3 py-2 inline-flex items-center gap-1.5 hover:border-primary/40">
            <GitBranch className="h-3.5 w-3.5" /> Graph
          </Link>
          <button
            onClick={() => toast.success("All decisions dispatched to responsible officers")}
            className="text-xs rounded-lg bg-gradient-primary text-primary-foreground px-3 py-2 inline-flex items-center gap-1.5 font-semibold hover:shadow-glow"
          >
            <Send className="h-3.5 w-3.5" /> Approve All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5 h-[calc(100vh-220px)] min-h-[640px]">
        {hasBackendData ? (
          <div className="surface-glass rounded-3xl p-8 min-h-[400px] overflow-hidden">
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Document preview</div>
              <div className="rounded-3xl border border-border bg-background/80 p-6 text-sm leading-relaxed text-muted-foreground overflow-auto max-h-[560px]">
                {data?.data.raw_text ? data.data.raw_text.slice(0, 3200) : "Text preview not available for this document."}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4 bg-surface/80">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Created</div>
                <div>{doc?.created_at ? new Date(doc.created_at).toLocaleString() : "Unknown"}</div>
              </div>
              <div className="rounded-2xl border border-border p-4 bg-surface/80">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Actions</div>
                <div className="font-semibold text-2xl">{decisionCards.length}</div>
              </div>
            </div>
          </div>
        ) : (
          <PdfViewerMock c={staticCase} activeHighlight={active} onHighlightClick={(h) => focusHighlight(h.id)} />
        )}

        <div className="overflow-auto scrollbar-thin pr-1 space-y-4">
          <div className="surface-glass rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Action Plan</div>
              <div className="text-sm font-semibold">{decisionCards.length} decisions extracted</div>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              avg conf · {Math.round(decisionCards.reduce((acc, item) => acc + item.confidence, 0) / Math.max(decisionCards.length, 1))}%
            </div>
          </div>

          {decisionCards.map((d, index) => (
            <DecisionCard
              key={d.id || `${index}-${d.action}`}
              decision={{
                id: d.id,
                action: d.action,
                reasoning: d.reasoning,
                alternatives: [],
                confidence: d.confidence,
                risk: d.risk as any,
                deadline: d.deadline,
              }}
              active={false}
              onApprove={() => toast.success(`"${d.action}" approved & dispatched`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
