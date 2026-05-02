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
    <div className="page">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{doc?.filename}</h1>
            <p className="text-sm text-slate-400 mt-0.5">Document ID: {docId}</p>
          </div>
        </div>
        <Link to={`/review/${docId}`} className="btn-primary">Open HITL Review →</Link>
      </div>

      {/* Case Details */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Case Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            ['Case Number', cd.case_number],
            ['Court', cd.court_name],
            ['Date of Judgment', cd.date_of_judgment],
            ['Petitioner', cd.petitioner],
            ['Respondent', cd.respondent],
            ['Bench', cd.bench],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{k}</p>
              <p className="font-semibold text-slate-800 text-sm">{v || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          Extracted Actions ({actions?.length || 0})
        </h2>
        <div className="space-y-4">
          {(actions || []).map(a => (
            <div key={a.id} className="card p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{a.description}</p>
                <span className={`badge flex-shrink-0 ${PRIORITY_COLOR[a.priority] || ''}`}>{a.priority}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-bold mb-1">Department</p>
                  <p className="font-semibold text-slate-700">{a.department}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold mb-1">Deadline</p>
                  <p className={`font-semibold ${a.deadline?.startsWith('Inferred') ? 'text-amber-600' : 'text-slate-700'}`}>{a.deadline}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold mb-1">Confidence</p>
                  <p className="font-semibold text-slate-700">{(a.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>
              {a.reasoning && (
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">{a.reasoning}</p>
              )}
              <div className="flex justify-end">
                <span className={`badge text-[10px] ${
                  a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700'
                  : a.status === 'REJECTED' ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
                }`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
