import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActions, type Action } from "@/lib/api";
import { DocumentList } from "@/components/nyaya/DocumentList";
import { RiskDot } from "@/components/nyaya/RiskDot";
import { StatusTag } from "@/components/nyaya/StatusTag";
import { DeadlineCountdown } from "@/components/nyaya/DeadlineCountdown";
import { ConfidenceRing } from "@/components/nyaya/ConfidenceRing";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const departments = ["Revenue", "Police", "Municipal", "Education", "Health"];
const urgencies = ["critical", "high", "medium", "low"] as const;
const actionTypes = ["Compliance", "Appeal", "Directive"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
        active ? "bg-primary text-primary-foreground border-primary shadow-glow" : "border-border-strong text-muted-foreground hover:text-foreground hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

export default function DecisionDashboard() {
  const [dept, setDept] = useState<string | null>(null);
  const [urg, setUrg] = useState<string | null>(null);
  const [act, setAct] = useState<string | null>(null);

  const { data: actionsData, isLoading, error } = useQuery({
    queryKey: ['actions', { status: null, department: dept, priority: urg }],
    queryFn: () => getActions({ department: dept || undefined, priority: urg || undefined }),
  });

  const actions = actionsData?.data?.actions || [];

  const filtered = useMemo(() => actions.filter(a =>
    (!act || a.action_type === act)
  ), [actions, act]);

  if (error) {
    return (
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-2">Failed to load actions</div>
          <div className="text-sm text-muted-foreground">Please check your connection to the backend</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Decision Dashboard</h1>
        <p className="text-muted-foreground mt-1.5">
          {isLoading ? "Loading actions..." : `${filtered.length} actions shown.`}
        </p>
      </div>

      <div className="surface-glass rounded-2xl p-5 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-24 shrink-0">Department</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={!dept} onClick={() => setDept(null)}>All</Chip>
            {departments.map(d => <Chip key={d} active={dept === d} onClick={() => setDept(d)}>{d}</Chip>)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-24 shrink-0">Priority</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={!urg} onClick={() => setUrg(null)}>All</Chip>
            {urgencies.map(u => <Chip key={u} active={urg === u} onClick={() => setUrg(u)}>{u}</Chip>)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-24 shrink-0">Action Type</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={!act} onClick={() => setAct(null)}>All</Chip>
            {actionTypes.map(a => <Chip key={a} active={act === a} onClick={() => setAct(a)}>{a}</Chip>)}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((action: Action) => (
            <Link
              key={action.id}
              to={`/workspace/${action.document_id}`}
              className="group rounded-2xl border border-border bg-gradient-surface p-5 hover:border-primary/60 hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground">{action.document_id}</div>
                  <StatusTag status={action.status.toLowerCase() as any} className="mt-2" />
                </div>
                <ConfidenceRing value={action.confidence * 100} size={48} stroke={4} />
              </div>
              <h3 className="font-display text-xl font-semibold leading-tight mb-2">{action.description}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{action.reasoning}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs">
                  <div className="font-medium">{action.department}</div>
                  <div className="text-muted-foreground">{action.priority}</div>
                </div>
                <DeadlineCountdown deadline={action.deadline} compact />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">No actions found</div>
          <div className="text-sm text-muted-foreground">Try adjusting your filters or upload a new document</div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Uploaded files</div>
            <div className="font-semibold text-lg">Visible in dashboard</div>
          </div>
          <Link to="/" className="text-xs text-primary-glow hover:underline">Upload a new judgment</Link>
        </div>
        <DocumentList />
      </div>
    </div>
  );
}
