import { cn } from "@/lib/utils";

const map: Record<string, { label: string; cls: string }> = {
  processing: { label: "Processing", cls: "bg-primary/15 text-primary-glow border-primary/30" },
  needs_review: { label: "Needs Review", cls: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30" },
  uploaded: { label: "Uploaded", cls: "bg-muted/15 text-muted-foreground border-border" },
  done: { label: "Done", cls: "bg-success/15 text-success border-success/30" },
  failed: { label: "Failed", cls: "bg-critical/15 text-critical border-critical/30" },
  processing_backend: { label: "Processing", cls: "bg-primary/15 text-primary-glow border-primary/30" },
};

export function StatusTag({ status, className }: { status: string; className?: string }) {
  const normalized = status?.toLowerCase().replace(/\s+/g, "_");
  const m = map[normalized] ?? { label: status, cls: "bg-muted/15 text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", m.cls, className)}>
      {(normalized === "processing" || normalized === "processing_backend") && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {m.label}
    </span>
  );
}
