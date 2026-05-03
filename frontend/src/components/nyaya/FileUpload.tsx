import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { uploadPDF, processDocument } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess?: (docId: string) => void;
  className?: string;
}

export function FileUpload({ onUploadSuccess, className }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const result = await uploadPDF(uploadedFile);
      setUploadResult(result);
      toast.success('File uploaded successfully!');

      // Auto-process the document
      setIsProcessing(true);
      try {
        await processDocument(result.data.doc_id);
        toast.success('Document processed successfully!');
        onUploadSuccess?.(result.data.doc_id);
      } catch (processError) {
        toast.error('Upload successful, but processing failed. You can try processing manually.');
        console.error('Processing error:', processError);
      }
    } catch (error) {
      toast.error('Upload failed: ' + (error as Error).message);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm font-medium text-muted-foreground">Upload Court Judgment PDF</div>

      {!uploadedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-border-strong rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            PDF files up to 10MB
          </div>
        </div>
      ) : (
        <div className="surface-glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{uploadedFile.name}</div>
                <div className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!uploadResult && !isUploading && (
                <>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    Upload & Process
                  </button>
                  <button
                    onClick={resetUpload}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}

              {uploadResult && !isProcessing && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}