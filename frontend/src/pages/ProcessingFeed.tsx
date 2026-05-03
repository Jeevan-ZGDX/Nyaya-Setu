import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDocuments, type DocumentsResponse } from "@/lib/api";
import { PipelineTrack } from "@/components/nyaya/PipelineTrack";
import { StatusTag } from "@/components/nyaya/StatusTag";
import { RiskDot } from "@/components/nyaya/RiskDot";
import { Loader2 } from "lucide-react";

export default function ProcessingFeed() {
  const { data, isLoading, error } = useQuery<DocumentsResponse>({
    queryKey: ["documents"],
    queryFn: getDocuments,
    refetchInterval: 5000,
  });

  const docs = data?.data.documents || [];
  const activeCount = docs.filter((d) => d.status.toLowerCase() !== "done" && d.status.toLowerCase() !== "completed").length;
  const currentStage = docs.some((d) => d.status.toLowerCase() === "processing")
    ? "reasoning"
    : docs.some((d) => d.status.toLowerCase() === "uploaded")
    ? "extraction"
    : "action_plan";

  if (error) {
    return (
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-2">Unable to load document feed</div>
          <div className="text-sm text-muted-foreground">Check backend status and refresh.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-6 py-8">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono mb-2">Live · auto-refreshing</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">AI Processing Feed</h1>
        <p className="text-muted-foreground mt-1.5">Real-time view of uploaded documents and where they stand in the pipeline.</p>
      </div>

      <div className="surface-glass rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active stage across all documents</div>
            <div className="font-display text-2xl font-semibold capitalize">{currentStage.replace("_", " ")}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold font-mono text-primary-glow">{activeCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">in flight</div>
          </div>
        </div>
        <PipelineTrack current={currentStage as any} size="lg" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              to={`/workspace/${doc.id}`}
              className="block rounded-2xl border border-border bg-surface/60 hover:border-primary/40 hover:bg-surface-elevated transition-all p-5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_140px] gap-5 items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <RiskDot risk={doc.status.toLowerCase() === "done" ? "low" : doc.status.toLowerCase() === "processing" ? "medium" : "high"} />
                    <span className="font-mono text-[11px] text-muted-foreground">{doc.id}</span>
                  </div>
                  <div className="font-medium text-sm mt-1.5 truncate">{doc.filename}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Uploaded {new Date(doc.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center justify-center">
                  <PipelineTrack current={doc.status.toLowerCase() === "uploaded" ? "ocr" : doc.status.toLowerCase() === "processing" ? "reasoning" : "action_plan"} size="sm" />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <StatusTag status={doc.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
