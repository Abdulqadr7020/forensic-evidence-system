import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface FileUploadProps {
  onFileAccepted?: (file: File) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
}

export type IngestionStep = 'IDLE' | 'SELECTED' | 'UPLOADING' | 'ENCRYPTING' | 'COMMITTING_MERKLE' | 'COMPLETED' | 'FAILED';

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileAccepted,
  maxSizeMB = 50,
  acceptedFormats = ['.pdf', '.docx', '.png', '.jpg', '.mp4', '.json'],
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<IngestionStep>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setErrorMessage(`File exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }
    setSelectedFile(file);
    setStep('SELECTED');
    if (onFileAccepted) {
      onFileAccepted(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const simulateIngestionPipeline = () => {
    if (!selectedFile) return;
    setStep('UPLOADING');
    setTimeout(() => {
      setStep('ENCRYPTING');
      setTimeout(() => {
        setStep('COMMITTING_MERKLE');
        setTimeout(() => {
          setStep('COMPLETED');
        }, 800);
      }, 800);
    }, 700);
  };

  const reset = () => {
    setSelectedFile(null);
    setStep('IDLE');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && step === 'IDLE' && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border border-dashed rounded-lg transition-all duration-200 text-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${
            dragActive
              ? 'border-[var(--primary-action)] bg-[var(--surface-hover)]'
              : 'border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--text-muted)]'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          disabled={disabled}
          onChange={handleChange}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />

        {step === 'IDLE' && (
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Click to browse or drag & drop evidence file
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Accepted: {acceptedFormats.join(', ')} · Max {maxSizeMB}MB
              </p>
            </div>
            <div className="mt-2">
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Browse Files
              </Button>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full max-w-md p-2.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ingestion Pipeline Status Indicator */}
            {step !== 'IDLE' && step !== 'SELECTED' && (
              <div className="w-full max-w-md flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>
                    {step === 'UPLOADING' && '1/3 Uploading plaintext bytes...'}
                    {step === 'ENCRYPTING' && '2/3 AES-256-GCM authenticated envelope encryption...'}
                    {step === 'COMMITTING_MERKLE' && '3/3 Committing SHA-256 leaf to Merkle ledger...'}
                    {step === 'COMPLETED' && 'Ingestion & verification receipt committed'}
                  </span>
                  <span className="font-mono tabular-nums">
                    {step === 'UPLOADING' && '35%'}
                    {step === 'ENCRYPTING' && '70%'}
                    {step === 'COMMITTING_MERKLE' && '95%'}
                    {step === 'COMPLETED' && '100%'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface-hover)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-[var(--primary-action)] transition-all duration-300"
                    style={{
                      width:
                        step === 'UPLOADING'
                          ? '35%'
                          : step === 'ENCRYPTING'
                          ? '70%'
                          : step === 'COMMITTING_MERKLE'
                          ? '95%'
                          : '100%',
                    }}
                  />
                </div>
              </div>
            )}

            {step === 'SELECTED' && (
              <div className="flex items-center gap-2 mt-1">
                <Button size="sm" variant="primary" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />} onClick={(e) => { e.stopPropagation(); simulateIngestionPipeline(); }}>
                  Ingest & Encrypt
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); reset(); }}>
                  Cancel
                </Button>
              </div>
            )}

            {step === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Encrypted & Committed to Merkle Checkpoint</span>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
