import { useMemo } from "react";
import type { CourtCase, Highlight } from "@/data/cases";
import { cn } from "@/lib/utils";

interface Props {
  c: CourtCase;
  activeHighlight?: string | null;
  onHighlightClick?: (h: Highlight) => void;
}

const kindStyle: Record<Highlight["kind"], string> = {
  directive: "bg-primary/20 border-b-2 border-primary text-primary-glow",
  date: "bg-warning/20 border-b-2 border-warning text-warning",
  party: "bg-accent/15 border-b-2 border-accent text-accent",
  statute: "bg-success/15 border-b-2 border-success text-success",
};

export function PdfViewerMock({ c, activeHighlight, onHighlightClick }: Props) {
  const grouped = useMemo(() => {
    const m = new Map<number, Highlight[]>();
    c.highlights.forEach((h) => {
      if (!m.has(h.paragraph)) m.set(h.paragraph, []);
      m.get(h.paragraph)!.push(h);
    });
    return m;
  }, [c.highlights]);

  const renderParagraph = (text: string, idx: number) => {
    const hs = grouped.get(idx) || [];
    if (hs.length === 0) return <span>{text}</span>;
    // naive: split & wrap each highlight occurrence
    let parts: (string | Highlight)[] = [text];
    hs.forEach((h) => {
      const next: (string | Highlight)[] = [];
      parts.forEach((p) => {
        if (typeof p !== "string") return next.push(p);
        const i = p.indexOf(h.text);
        if (i === -1) return next.push(p);
        next.push(p.slice(0, i), h, p.slice(i + h.text.length));
      });
      parts = next;
    });
    return parts.map((p, i) =>
      typeof p === "string" ? (
        <span key={i}>{p}</span>
      ) : (
        <button
          key={i}
          id={`hl-${p.id}`}
          onClick={() => onHighlightClick?.(p)}
          className={cn(
            "rounded-sm px-0.5 mx-0.5 cursor-pointer transition-all align-baseline",
            kindStyle[p.kind],
            activeHighlight === p.id && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-[1.02]"
          )}
          title={p.note || p.kind}
        >
          {p.text}
        </button>
      )
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden h-full flex flex-col">
      <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-surface-elevated">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-6 rounded-sm bg-gradient-to-br from-foreground/90 to-muted-foreground grid place-items-center">
            <span className="text-[8px] font-mono font-bold text-background">PDF</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{c.title}</div>
            <div className="text-[11px] text-muted-foreground font-mono">{c.id} · {c.court}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" /> Directive
          <span className="h-2 w-2 rounded-full bg-warning ml-2" /> Date
          <span className="h-2 w-2 rounded-full bg-accent ml-2" /> Party
          <span className="h-2 w-2 rounded-full bg-success ml-2" /> Statute
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        <article className="mx-auto max-w-2xl bg-foreground/[0.03] my-6 rounded-md border border-border-strong p-8 leading-7 text-[13px] text-foreground/90 font-serif">
          <header className="text-center pb-4 mb-5 border-b border-border-strong">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Certified Copy</div>
            <div className="font-semibold text-base">{c.court}</div>
            <div className="text-xs text-muted-foreground mt-1 font-sans">Case No. {c.id} · Filed {c.filedOn}</div>
          </header>
          <div className="space-y-4">
            {c.pdfBody.map((p, i) => (
              <p key={i} className="text-justify">
                {renderParagraph(p, i)}
              </p>
            ))}
          </div>
          <footer className="mt-8 pt-4 border-t border-border-strong text-[11px] text-muted-foreground font-sans flex justify-between">
            <span>— Sd/- Hon'ble Justice (Presiding)</span>
            <span className="font-mono">Page 1 of 1</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
