/**
 * Upload.jsx — POST /upload → POST /process/{doc_id} → redirect to /review/{doc_id}
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadPDF, processDocument } from '../api';

const STAGES = ['Uploading file…', 'Extracting text (OCR)…', 'Analysing with AI…', 'Generating action plan…'];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(-1); // -1 = idle
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
      // Stage 0: upload
      setStage(0);
      const uploadRes = await uploadPDF(file);
      const docId = uploadRes.data.doc_id;

      // Stage 1-3: process (one network call, stages are cosmetic)
      setStage(1);
      await new Promise(r => setTimeout(r, 600));
      setStage(2);
      const processRes = await processDocument(docId);
      setStage(3);
      await new Promise(r => setTimeout(r, 500));

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
          <h1 className="text-3xl font-extrabold text-slate-900">Upload Judgment</h1>
          <p className="text-slate-500 mt-1">Upload a PDF court judgment for AI-powered compliance extraction.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`card p-10 text-center border-2 border-dashed transition-all duration-200 ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
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
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-colors ${
              dragging ? 'bg-blue-600' : 'bg-slate-100'
            }`}>
              <UploadCloud className={`w-10 h-10 ${dragging ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">Drag & drop your PDF</p>
              <p className="text-sm text-slate-400 mt-1">or click to browse — scanned and digital PDFs supported</p>
            </div>
          </div>
        </div>

        {/* Selected file */}
        {file && !busy && (
          <div className="card p-4 mt-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* Progress stages */}
        {busy && (
          <div className="card p-6 mt-4 space-y-5">
            {STAGES.map((s, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    done ? 'bg-emerald-500' : active ? 'bg-blue-600' : 'bg-slate-100'
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : active
                        ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                        : <span className="text-xs text-slate-400 font-bold">{i + 1}</span>
                    }
                  </div>
                  <p className={`text-sm font-medium ${done ? 'text-emerald-600' : active ? 'text-blue-700' : 'text-slate-400'}`}>{s}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        {file && !busy && (
          <button onClick={handleSubmit} className="btn-primary mt-6 w-full py-3 text-base">
            Analyse Document →
          </button>
        )}
      </div>
    </div>
  );
}
