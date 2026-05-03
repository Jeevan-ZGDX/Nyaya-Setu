/**
 * Document.jsx — GET /document/{docId} full detail view
 * Read-only detailed view of a processed document
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, ShieldCheck } from 'lucide-react';
import { getDocument } from '../api';

const PRIORITY_COLOR = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-slate-100 text-slate-600',
};

export default function DocumentPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getDocument(docId);
        setData(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [docId]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="page text-center py-24">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-red-600 font-medium">{error}</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-4">← Go Back</button>
    </div>
  );

  const { document: doc, structured_json, actions } = data || {};
  const cd = structured_json?.case_details || {};

  return (
    <div className="page space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <p className="section-heading">Document details</p>
            <h1 className="text-3xl font-extrabold text-slate-900">{doc?.filename}</h1>
            <p className="text-sm text-slate-500 mt-1">Document ID: {docId}</p>
          </div>
        </div>
        <Link to={`/review/${docId}`} className="btn-primary">Open review</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Case details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                ['Case Number', cd.case_number],
                ['Court', cd.court_name],
                ['Date of Judgment', cd.date_of_judgment],
                ['Petitioner', cd.petitioner],
                ['Respondent', cd.respondent],
                ['Bench', cd.bench],
              ].map(([k, v]) => (
                <div key={k} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900 text-sm">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-900">Extracted actions</h2>
            </div>
            <div className="space-y-4">
              {(actions || []).map((a) => (
                <div key={a.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{a.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{a.action_type}</p>
                    </div>
                    <span className={`badge ${PRIORITY_COLOR[a.priority] || ''}`}>{a.priority}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-4">
                    <div>
                      <p className="text-slate-400 uppercase font-semibold mb-1">Department</p>
                      <p className="font-semibold text-slate-700">{a.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold mb-1">Deadline</p>
                      <p className={`font-semibold ${a.deadline?.startsWith('Inferred') ? 'text-amber-600' : 'text-slate-700'}`}>{a.deadline}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold mb-1">Confidence</p>
                      <p className="font-semibold text-slate-700">{(a.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  {a.reasoning && (
                    <p className="text-sm text-slate-600 italic border-t border-slate-200 pt-4 mt-4">{a.reasoning}</p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <span className={`badge text-[10px] ${a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : a.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <p className="section-heading">Quick actions</p>
            <div className="space-y-3 text-sm text-slate-600">
              <p>Review all extracted actions in the HITL workflow.</p>
              <p>Use the dashboard for filtered oversight and compliance tracking.</p>
              <p>Approved items become verified tasks for execution.</p>
            </div>
          </div>

          <div className="card p-6">
            <p className="section-heading">Document status</p>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Status</p>
                <p className="text-slate-500">{doc?.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Verified actions</p>
                <p className="text-slate-500">{actions?.filter((a) => a.status !== 'PENDING').length} of {actions?.length} reviewed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
