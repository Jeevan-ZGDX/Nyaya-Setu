/**
 * Dashboard.jsx — GET /actions with live filtering by status/dept/priority
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, Clock, Shield,
  ChevronRight, RefreshCw, SlidersHorizontal, Loader2
} from 'lucide-react';
import { getActions } from '../api';

const PRIORITY_COLOR = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-slate-100 text-slate-600',
};
const STATUS_COLOR = {
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200',
};

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', department: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getActions(filters);
      setActions(res.data.actions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    total: actions.length,
    pending: actions.filter((a) => a.status === 'PENDING').length,
    approved: actions.filter((a) => a.status === 'APPROVED').length,
    high: actions.filter((a) => a.priority === 'High').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-heading">Execution dashboard</p>
          <h1 className="text-4xl font-extrabold text-slate-900">Compliance operations</h1>
          <p className="text-slate-500 mt-3 max-w-2xl">
            Review extracted actions and monitor the status of compliance directives generated from judgments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/upload" className="btn-primary">+ Upload Judgment</Link>
          <button onClick={load} className="btn-ghost flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total actions" value={counts.total} color="bg-blue-50" icon={<Shield className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Pending review" value={counts.pending} color="bg-amber-50" icon={<Clock className="w-6 h-6 text-amber-600" />} />
        <StatCard title="Approved" value={counts.approved} color="bg-emerald-50" icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />} />
        <StatCard title="High priority" value={counts.high} color="bg-red-50" icon={<AlertCircle className="w-6 h-6 text-red-600" />} />
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4">
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        {[
          { key: 'status', label: 'Status', opts: ['', 'PENDING', 'APPROVED', 'REJECTED'] },
          { key: 'priority', label: 'Priority', opts: ['', 'High', 'Medium', 'Low'] },
        ].map(({ key, label, opts }) => (
          <div key={key} className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase">{label}</label>
            <select
              value={filters[key]}
              onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
              className="input w-36 py-1.5"
            >
              {opts.map((o) => <option key={o} value={o}>{o || `All ${label}s`}</option>)}
            </select>
          </div>
        ))}
        <input
          placeholder="Filter department…"
          value={filters.department}
          onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          className="input w-52 py-1.5"
        />
        {(filters.status || filters.priority || filters.department) && (
          <button onClick={() => setFilters({ status: '', priority: '', department: '' })}
            className="text-xs text-blue-600 font-semibold hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-3 p-6">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-slate-400 text-sm mt-1">Is the backend running on port 8000?</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No actions found.</p>
            <p className="text-sm mt-1">Upload a judgment to generate compliance actions.</p>
            <Link to="/upload" className="btn-primary mt-4 inline-block">Upload PDF</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-header border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actions.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.action_type}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{a.department}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${a.deadline?.toLowerCase().startsWith('inferred') ? 'text-amber-600' : 'text-slate-800'}`}>{a.deadline}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${PRIORITY_COLOR[a.priority] || 'bg-slate-100 text-slate-600'}`}>{a.priority}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(a.confidence * 100).toFixed(0)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{(a.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_COLOR[a.status] || ''}`}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/review/${a.document_id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
