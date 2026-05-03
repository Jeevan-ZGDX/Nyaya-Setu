import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Flag, 
  ChevronLeft, 
  ExternalLink, 
  FileText,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function ActionPlan() {
  const navigate = useNavigate();
  const [actions, setActions] = useState([
    {
      id: 'a1',
      description: 'Ensure compliance with environmental regulations regarding waste disposal.',
      intent: 'Mandatory Compliance',
      confidence: 94,
      source: 'Page 12, Para 3',
      status: 'pending'
    },
    {
      id: 'a2',
      description: 'Form a committee to review existing environmental policies within 60 days.',
      intent: 'Advisory',
      confidence: 88,
      source: 'Page 15, Para 2',
      status: 'pending'
    }
  ]);

  const handleStatus = (id, status) => {
    setActions(actions.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Extraction Verification</h1>
            <p className="text-sm text-slate-500">Case Reference: <span className="font-bold text-slate-700">WP(C) 123/2023</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> View Original
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            Submit for Approval
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side: Document Viewer */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-4 h-4" /> Document Viewer
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <button className="p-1.5 hover:bg-slate-50 border-r border-slate-200"><ZoomOut className="w-4 h-4 text-slate-600" /></button>
                <div className="px-3 flex items-center text-xs font-bold text-slate-600 bg-slate-50/30">100%</div>
                <button className="p-1.5 hover:bg-slate-50 border-l border-slate-200"><ZoomIn className="w-4 h-4 text-slate-600" /></button>
              </div>
              <button className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"><RotateCw className="w-4 h-4 text-slate-600" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 pdf-viewer-placeholder relative">
             <div className="bg-white shadow-lg mx-auto w-[600px] min-h-[800px] p-12 text-slate-800 font-serif text-sm leading-relaxed space-y-6 border border-slate-100">
                <div className="text-center font-bold uppercase space-y-1 mb-8">
                  <p>In the High Court of Karnataka</p>
                  <p>WP(C) 123/2023</p>
                </div>
                <p><strong>Ramesh Kumar</strong> vs. <strong>State of Karnataka & BBMP</strong></p>
                <p>... After hearing the arguments from both parties, the court observes that the environmental concerns raised are of significant public interest ...</p>
                <div className="bg-yellow-100 ring-2 ring-yellow-400 rounded p-2 my-4">
                   <p className="font-bold">OPERATIVE PORTION:</p>
                   <p>The respondent BBMP is hereby directed to ensure compliance with environmental regulations regarding waste disposal in the identified wetlands ...</p>
                </div>
                <p>... The matter is listed for further hearing after 30 days ...</p>
             </div>
          </div>
        </div>

        {/* Right Side: AI Extractions */}
        <div className="w-[480px] flex flex-col gap-6 overflow-hidden">
          <div className="premium-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" /> Case Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Case No</p>
                <p className="text-sm font-bold text-slate-800">WP(C) 123/2023</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                <p className="text-sm font-bold text-slate-800">27/10/2023</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Bench</p>
                <p className="text-sm font-bold text-slate-800">Hon'ble Justice A. Sharma</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> AI Extractions
            </h3>
            
            <div className="flex-1 overflow-auto space-y-4 pr-2">
              {actions.map((action) => (
                <div key={action.id} className={`premium-card p-6 border-l-4 ${
                  action.status === 'approved' ? 'border-l-emerald-500' : 
                  action.status === 'rejected' ? 'border-l-red-500' : 'border-l-blue-500'
                } transition-all duration-300`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        action.intent === 'Mandatory Compliance' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {action.intent}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Directive Description</p>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke={action.confidence > 90 ? "#10b981" : "#f59e0b"} strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * action.confidence / 100)} />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-slate-700">{action.confidence}%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm font-semibold text-slate-800 mb-4">{action.description}</p>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-6">
                    <span>Source: {action.source}</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatus(action.id, 'approved')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        action.status === 'approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE
                    </button>
                    <button className="px-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button 
                      onClick={() => handleStatus(action.id, 'rejected')}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        action.status === 'rejected' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <button className="px-3 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all"><Flag className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
