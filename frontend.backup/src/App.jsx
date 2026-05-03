import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Scale, LayoutDashboard, Upload, ListChecks, BookOpen } from 'lucide-react';
import UploadPage from './pages/Upload';
import Dashboard from './pages/Dashboard';
import ReviewPage from './pages/Review';
import DocumentPage from './pages/Document';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/actions', label: 'All Actions', icon: ListChecks },
];

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">Nyaya-Setu</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Compliance Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">NS</div>
          <div>
            <p className="text-sm font-semibold">Legal Officer</p>
            <p className="text-xs text-slate-400">Government of Karnataka</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/actions" element={<Dashboard showAll />} />
            <Route path="/document/:docId" element={<DocumentPage />} />
            <Route path="/review/:docId" element={<ReviewPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
