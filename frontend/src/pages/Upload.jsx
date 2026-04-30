import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  FileCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => navigate('/document/123'), 500);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5 fill-blue-600" /> Powered by GPT-4o
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Ingest Judgment</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Upload scanned or digital PDFs for cognitive legal extraction, intent classification, and action mapping.</p>
      </div>

      <div 
        className={`relative group premium-card p-1 text-center transition-all duration-500 ${
          isDragging ? 'ring-4 ring-blue-500/20 border-blue-500 bg-blue-50/50' : 'hover:border-slate-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className={`m-4 border-2 border-dashed rounded-xl py-20 px-12 transition-all ${
          isDragging ? 'border-blue-400 bg-white' : 'border-slate-200'
        }`}>
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className={`absolute inset-0 bg-blue-100 rounded-3xl rotate-6 transition-transform group-hover:rotate-12 duration-500 ${isDragging ? 'scale-110' : ''}`}></div>
            <div className={`absolute inset-0 bg-blue-600 rounded-3xl -rotate-6 transition-transform group-hover:-rotate-12 duration-500 flex items-center justify-center ${isDragging ? 'scale-110' : ''}`}>
              <UploadCloud className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800">Drag & drop legal PDF</h3>
          <p className="text-slate-500 mt-2 text-sm">Max file size: 50MB. Scanned and Digital PDFs supported.</p>
          
          <div className="mt-8">
            <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
              Browse Local Files
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </div>

      {file && (
        <div className="premium-card p-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{file.name}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY TO PROCESS</p>
              </div>
            </div>
            {!isUploading && (
              <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isUploading ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-blue-600 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                   {progress < 40 ? 'Extracting Text...' : progress < 80 ? 'Analyzing Intent...' : 'Generating Action Plan...'}
                </span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleUpload}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
            >
              <FileCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Analyze Document
            </button>
          )}
        </div>
      )}

      {/* Integration Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        {[
          { title: 'OCR Processing', desc: 'Automatic deskewing and noise removal for scanned judgment copies.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
          { title: 'Intent Classification', desc: 'Categorizes directives into Mandatory, Advisory, or Conditional.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
          { title: 'Full Traceability', desc: 'Every extracted task maps back to the specific paragraph in source PDF.', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
        ].map((item, i) => (
          <div key={i} className="flex flex-col gap-3 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            {item.icon}
            <h4 className="font-bold text-slate-800">{item.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
