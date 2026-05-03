/**
 * Review.jsx — HITL Screen (GET /document + POST /verify/{id})
 * Side-by-side: raw text viewer | action cards with Approve / Reject
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Flag,
  ChevronLeft, Loader2, AlertCircle,
  FileText, Info, ShieldCheck
} from 'lucide-react';
import { getDocument, verifyAction } from '../api';

const PRIORITY_COLOR = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-slate-100 text-slate-600',
};

function ConfidenceRing({ value }) {
  const pct = Math.round(value * 100);
  const r = 20, c = 2 * Math.PI * r;
  const dash = (c * pct) / 100;
  const color = pct >= 90 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
        {pct}%
      </span>
    </div>
  );
}

export default function ReviewPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDocument(docId);
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [docId]);

  const handleVerify = async (actionId, decision) => {
    setVerifying((v) => ({ ...v, [actionId]: true }));
    try {
      await verifyAction(actionId, decision);
      setData((prev) => ({
        ...prev,
        actions: prev.actions.map((a) =>
          a.id === actionId ? { ...a, status: decision.toUpperCase() } : a
        )
      }));
    } catch (e) {
      alert(`Verification failed: ${e.message}`);
    } finally {
      setVerifying((v) => ({ ...v, [actionId]: false }));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-600 font-medium text-lg">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-ghost">← Go Back</button>
      </div>
    </div>
  );

  const { document: doc, structured_json, raw_text, actions } = data || {};
  const caseDetails = structured_json?.case_details || {};

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400 mb-1">Review workspace</p>
            <h1 className="text-xl font-bold text-slate-900">AI extraction verification</h1>
            <p className="text-sm text-slate-500 mt-1">{doc?.filename} · Status: <span className="font-semibold text-blue-600">{doc?.status}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{actions?.filter((a) => a.status !== 'PENDING').length}/{actions?.length} reviewed</span>
          <button onClick={() => navigate('/')} className="btn-primary">Dashboard</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.26em]">Document Text</span>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {raw_text ? (
              <pre className="font-serif text-sm text-slate-700 leading-7 whitespace-pre-wrap">{raw_text}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No text extracted yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[520px] flex-shrink-0 flex flex-col overflow-hidden bg-white">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Case metadata</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Case No', caseDetails.case_number],
                ['Date', caseDetails.date_of_judgment],
                ['Court', caseDetails.court_name],
                ['Bench', caseDetails.bench],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{label}</p>
                  <p className="font-semibold text-slate-800 truncate">{val || '—'}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Parties</p>
                <p className="font-semibold text-slate-800 text-xs">{caseDetails.petitioner} vs {caseDetails.respondent}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">AI extractions ({actions?.length || 0})</span>
            </div>

            {actions?.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-10">No actions extracted.</p>
            )}

            {actions?.map((action) => {
              const busy = verifying[action.id];
              const approved = action.status === 'APPROVED';
              const rejected = action.status === 'REJECTED';
              const done = approved || rejected;

              return (
                <div key={action.id} className={`border rounded-3xl p-5 transition-all ${approved ? 'border-emerald-300 bg-emerald-50/30' : rejected ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-1.5">
                      <span className={`badge ${PRIORITY_COLOR[action.priority] || ''}`}>{action.priority}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{action.action_type}</span>
                    </div>
                    <ConfidenceRing value={action.confidence} />
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-3">{action.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 rounded-3xl p-3 mb-4 border border-slate-100">
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Department</p>
                      <p className="font-semibold text-slate-700">{action.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Deadline</p>
                      <p className={`font-semibold ${action.deadline?.toLowerCase().startsWith('inferred') ? 'text-amber-600' : 'text-slate-700'}`}>{action.deadline}</p>
                    </div>
                    {action.reasoning && (
                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">AI reasoning</p>
                        <p className="text-slate-600 leading-relaxed">{action.reasoning}</p>
                      </div>
                    )}
                  </div>

                  {done ? (
                    <div className={`flex items-center justify-center gap-2 py-2 rounded-2xl text-sm font-semibold ${approved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {approved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {action.status}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() => handleVerify(action.id, 'approved')}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleVerify(action.id, 'rejected')}
                        className="rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button className="rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 px-3 py-2 text-xs transition-all">
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
