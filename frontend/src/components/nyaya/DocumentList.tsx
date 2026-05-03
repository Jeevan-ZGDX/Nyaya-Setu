import { useQuery } from '@tanstack/react-query';
import { getDocuments, type DocumentsResponse } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Download, FileText, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DocumentList() {
  const { data, isLoading, error } = useQuery<DocumentsResponse>({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-8 text-center">
        <div className="text-primary mb-2">Loading documents...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-8 text-center text-red-400">
        Failed to load uploaded documents.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {data.data.documents.map((doc) => (
        <Link
          key={doc.id}
          to={`/workspace/${doc.id}`}
          className="group rounded-2xl border border-border bg-gradient-surface p-5 hover:border-primary/60 hover:shadow-glow transition-all"
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{doc.filename}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Uploaded {new Date(doc.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{doc.actions_count} actions</div>
              <div className="capitalize">{doc.status.toLowerCase()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary text-xs">
            <Download className="h-3.5 w-3.5" />
            View in dashboard
          </div>
        </Link>
      ))}
    </div>
  );
}