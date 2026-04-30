import React from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ChevronRight,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { title: 'Total Cases', value: '1,248', change: '+15%', icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pending Compliance', value: '187', change: '86 new', icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'High Priority', value: '45', change: '12 critical', icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Contempt Risk', value: '42', change: 'Moderate', icon: <ShieldAlert className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const actions = [
    { id: 'NS-2023-4512', action: 'File Compliance Report: WP 1102/2023', dept: 'Revenue', deadline: '28 Oct 2023', sub: '(Due Tomorrow)', priority: 'Critical', pColor: 'bg-red-100 text-red-700' },
    { id: 'NS-2023-4513', action: 'Submit status report on lake encroachment', dept: 'BBMP', deadline: '02 Nov 2023', sub: '(Soon)', priority: 'High', pColor: 'bg-amber-100 text-amber-700' },
    { id: 'NS-2023-4514', action: 'Process pension arrears for Petitioner', dept: 'Finance', deadline: '02 Nov 2023', sub: '(Soon)', priority: 'Medium', pColor: 'bg-blue-100 text-blue-700' },
    { id: 'NS-2023-4515', action: 'Formulate committee for waste management', dept: 'BBMP', deadline: '05 Nov 2023', sub: '(Soon)', priority: 'Critical', pColor: 'bg-red-100 text-red-700' },
    { id: 'NS-2023-4516', action: 'Clear pending dues to the petitioner', dept: 'Revenue', deadline: '10 Nov 2023', sub: '(Scheduled)', priority: 'Medium', pColor: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Cognitive Compliance Engine Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reference..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card p-6 flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md bg-slate-50 text-slate-500`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-60 w-2/3`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Plans Table */}
      <div className="premium-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Action Plans</h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Case Reference</th>
                <th className="px-6 py-4">Required Action</th>
                <th className="px-6 py-4">Assigned Dept</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">#{item.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">{item.action}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {item.dept[0]}
                      </div>
                      <span className="font-medium text-slate-700">{item.dept}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.deadline}</span>
                      <span className={`text-[10px] font-bold uppercase ${item.sub.includes('Tomorrow') ? 'text-red-500' : 'text-amber-500'}`}>
                        {item.sub}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.pColor}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/document/${item.id}`} 
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
      </div>
    </div>
  );
}
