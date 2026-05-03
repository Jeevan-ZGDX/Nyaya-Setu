/**
 * Upload.jsx — POST /upload → POST /process/{doc_id} → redirect to /review/{doc_id}
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { uploadPDF, processDocument } from '../api';

const STAGES = ['Uploading file…', 'Extracting text (OCR)…', 'Analysing with AI…', 'Generating action plan…'];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState('');

  const pickFile = (f) => {
    if (!f?.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    try {
      setStage(0);
      const uploadRes = await uploadPDF(file);
      const docId = uploadRes.data.doc_id;

      setStage(1);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStage(2);
      await processDocument(docId);
      setStage(3);
      await new Promise((resolve) => setTimeout(resolve, 400));

      navigate(`/review/${docId}`);
    } catch (err) {
      setError(err.message);
      setStage(-1);
    }
  };

  const busy = stage >= 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="section-heading">New case intake</p>
          <h1 className="text-4xl font-extrabold text-slate-900">Convert judgments into verified action plans</h1>
          <p className="text-slate-500 mt-3 max-w-2xl">
            Upload a court judgment PDF and let Nyaya-Setu extract orders, infer deadlines, and create compliance tasks for human review.
          </p>
        </div>
        <div className="card p-6 max-w-sm">
          <p className="text-xs uppercase tracking-[0.26em] text-slate-400 mb-4">Workflow</p>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="flex items-start gap-3"><Shield className="w-4 h-4 text-blue-500 mt-1" /> AI extracts legal directives automatically.</p>
            <p className="flex items-start gap-3"><Shield className="w-4 h-4 text-blue-500 mt-1" /> Review and approve the generated actions.</p>
            <p className="flex items-start gap-3"><Shield className="w-4 h-4 text-blue-500 mt-1" /> Export tasks for delivery and tracking.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`card p-10 text-center border-2 border-dashed transition-all duration-200 ${
              dragging ? 'border-blue-500 bg-blue-50/80' : 'border-slate-200 hover:border-slate-300'
            } ${busy ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
            onClick={() => !busy && document.getElementById('pdf-input').click()}
          >
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files[0])}
            />
            <div className="mx-auto flex max-w-xs flex-col items-center gap-5">
              <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center transition-colors ${
                dragging ? 'bg-blue-600' : 'bg-slate-100'
              }`}>
                <UploadCloud className={`w-10 h-10 ${dragging ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">Drag & drop your PDF</p>
                <p className="text-sm text-slate-500 mt-2">Scanned and digital court judgments are both supported.</p>
              </div>
            </div>
          </div>

          {file && !busy && (
            <div className="card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-3xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4 mr-2" /> Remove
              </button>
            </div>
          )}

          {busy && (
            <div className="card p-6 space-y-4">
              <p className="section-heading">Processing progress</p>
              {STAGES.map((s, i) => {
                const done = i < stage;
                const active = i === stage;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      done ? 'bg-emerald-500' : active ? 'bg-blue-600' : 'bg-slate-100'
                    }`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : active ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <span className="text-xs font-bold text-slate-400">{i + 1}</span>}
                    </div>
                    <div>
                      <p className={`font-semibold ${done ? 'text-slate-800' : active ? 'text-slate-900' : 'text-slate-500'}`}>{s}</p>
                      <p className="text-sm text-slate-400">{done ? 'Completed' : active ? 'In progress' : 'Pending'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {file && !busy && (
            <button onClick={handleSubmit} className="btn-primary w-full">Analyse Document →</button>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel">
            <p className="section-heading">Upload checklist</p>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• Use a clear court judgment PDF for best extraction accuracy.</li>
              <li>• Confirm the file contains the full judgment body and orders.</li>
              <li>• Review all generated actions on the verification screen.</li>
              <li>• Approved items flow into the compliance dashboard.</li>
            </ul>
          </div>

          <div className="card p-6">
            <p className="section-heading">Why Nyaya-Setu?</p>
            <div className="grid gap-4">
              {[
                { title: 'Faster compliance', desc: 'Automated extraction removes manual judgment reading overhead.' },
                { title: 'Human review first', desc: 'Every action is verified before it enters execution workflows.' },
                { title: 'Action-ready output', desc: 'Tasks are structured with deadlines, departments, and priorities.' }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
