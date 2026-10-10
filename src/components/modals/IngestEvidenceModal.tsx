import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { HashDisplay } from '../security/HashDisplay';
import { Alert } from '../ui/Alert';
import { useToast } from '../../context/ToastContext';
import { DocumentClassification, DocumentRecord, CaseRecord } from '../../types/models';
import { fetchCases } from '../../services/db';
import { 
  ShieldCheck, 
  Lock, 
  Binary, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Copy, 
  RefreshCw,
  FileText
} from 'lucide-react';

export interface IngestEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (doc: DocumentRecord) => void;
}

type IngestionStage = 'FORM' | 'PIPELINE' | 'RECEIPT';

interface PipelineStep {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  previewValue?: string;
}

interface IngestionReceiptData {
  evidenceId: string;
  caseId: string;
  caseNumber: string;
  title: string;
  storagePath: string;
  sha256Plaintext: string;
  sha256Ciphertext: string;
  merkleLeafHash: string;
  checkpointSequence: number;
  iv: string;
  authTag: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export const IngestEvidenceModal: React.FC<IngestEvidenceModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const { success, error: toastError, info } = useToast();
  
  // Available cases
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<'FIR' | 'DIGITAL_EVIDENCE' | 'FORENSIC_REPORT' | 'WITNESS_STATEMENT'>('DIGITAL_EVIDENCE');
  const [classification, setClassification] = useState<DocumentClassification>('SECRET');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Workflow state
  const [stage, setStage] = useState<IngestionStage>('FORM');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedStepId, setFailedStepId] = useState<number | null>(null);
  const [receiptData, setReceiptData] = useState<IngestionReceiptData | null>(null);

  // Stepper definition
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 1,
      label: 'Plaintext Digest (SHA-256)',
      description: 'Computing cryptographic baseline hash of raw bytes for non-repudiation',
      icon: <Binary className="w-4 h-4 text-sky-400" />,
      status: 'PENDING',
    },
    {
      id: 2,
      label: 'AES-256-GCM Encryption',
      description: 'Authenticated envelope with 12-byte CSPRNG IV & 16-byte Poly1305/GCM tag',
      icon: <Lock className="w-4 h-4 text-purple-400" />,
      status: 'PENDING',
    },
    {
      id: 3,
      label: 'Ciphertext Digest (SHA-256)',
      description: 'Deriving encrypted payload integrity fingerprint prior to network transmission',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      status: 'PENDING',
    },
    {
      id: 4,
      label: 'Vault Storage & Merkle Ledger Anchor',
      description: 'Committing payload to Supabase Vault & anchoring leaf to Merkle checkpoint',
      icon: <Database className="w-4 h-4 text-amber-400" />,
      status: 'PENDING',
    },
  ]);

  // Load cases dynamically
  useEffect(() => {
    if (isOpen) {
      fetchCases().then((loadedCases) => {
        setCases(loadedCases);
        if (loadedCases.length > 0 && !selectedCaseId) {
          setSelectedCaseId(loadedCases[0].id);
        }
      });
    }
  }, [isOpen]);

  // Reset form when modal closes
  const handleModalClose = () => {
    if (stage === 'PIPELINE') return; // Prevent closing mid-encryption
    setStage('FORM');
    setUploadedFile(null);
    setDocName('');
    setErrorMessage(null);
    setFailedStepId(null);
    setReceiptData(null);
    setSteps((prev) =>
      prev.map((s) => ({ ...s, status: 'PENDING', previewValue: undefined }))
    );
    onClose();
  };

  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
    if (!docName) {
      setDocName(file.name);
    }
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Start real-time paced cryptographic ingestion
  const handleStartIngestion = async () => {
    if (!uploadedFile || !selectedCaseId) return;

    setStage('PIPELINE');
    setErrorMessage(null);
    setFailedStepId(null);

    const updateStepStatus = (
      stepId: number, 
      status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED', 
      previewValue?: string
    ) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status, previewValue: previewValue ?? s.previewValue } : s
        )
      );
    };

    try {
      // Step 1: Active Plaintext Digest
      updateStepStatus(1, 'ACTIVE');
      await new Promise((resolve) => setTimeout(resolve, 350));

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('caseId', selectedCaseId);
      formData.append('title', docName || uploadedFile.name);
      formData.append('description', `Ingested evidence for ${selectedCase?.caseNumber || 'case'}`);
      formData.append('category', category);
      formData.append('classification', classification);

      // Perform upload to Express Backend
      const response = await fetch('http://localhost:3001/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload request failed' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const receipt = await response.json();

      // Step 1 Completed with preview
      updateStepStatus(1, 'COMPLETED', receipt.hashes?.sha256Plaintext);

      // Step 2: AES-256-GCM
      updateStepStatus(2, 'ACTIVE');
      await new Promise((resolve) => setTimeout(resolve, 350));
      updateStepStatus(2, 'COMPLETED', `IV: ${receipt.iv} · Tag: ${receipt.authTag}`);

      // Step 3: Ciphertext Digest
      updateStepStatus(3, 'ACTIVE');
      await new Promise((resolve) => setTimeout(resolve, 350));
      updateStepStatus(3, 'COMPLETED', receipt.hashes?.sha256Ciphertext);

      // Step 4: Supabase Vault & Merkle Ledger
      updateStepStatus(4, 'ACTIVE');
      await new Promise((resolve) => setTimeout(resolve, 350));
      updateStepStatus(4, 'COMPLETED', `Checkpoint #${receipt.checkpointSequence} · Leaf: ${receipt.merkleLeafHash?.slice(0, 16)}…`);

      // Store receipt and transition to receipt state
      const finalReceipt: IngestionReceiptData = {
        evidenceId: receipt.evidenceId,
        caseId: selectedCaseId,
        caseNumber: selectedCase?.caseNumber || 'CR-2026-0104',
        title: docName || uploadedFile.name,
        storagePath: receipt.storagePath,
        sha256Plaintext: receipt.hashes?.sha256Plaintext,
        sha256Ciphertext: receipt.hashes?.sha256Ciphertext,
        merkleLeafHash: receipt.merkleLeafHash,
        checkpointSequence: receipt.checkpointSequence,
        iv: receipt.iv,
        authTag: receipt.authTag,
        mimeType: uploadedFile.type || 'application/octet-stream',
        fileSizeBytes: uploadedFile.size,
        createdAt: receipt.createdAt || new Date().toISOString(),
      };

      setReceiptData(finalReceipt);
      setStage('RECEIPT');
      success('Evidence Ingested & Encrypted', `${finalReceipt.title} committed to Merkle Checkpoint #${receipt.checkpointSequence}.`);

    } catch (err) {
      console.error('Ingestion Pipeline Failed:', err);
      const msg = err instanceof Error ? err.message : 'Ingestion failed';
      setErrorMessage(msg);
      toastError('Ingestion Pipeline Failed', msg);
      
      // Mark first pending/active step as failed
      setSteps((prev) => {
        let marked = false;
        return prev.map((s) => {
          if (!marked && (s.status === 'ACTIVE' || s.status === 'PENDING')) {
            marked = true;
            setFailedStepId(s.id);
            return { ...s, status: 'FAILED' };
          }
          return s;
        });
      });
    }
  };

  // Convert receipt to DocumentRecord and notify parent
  const handleFinishReceipt = () => {
    if (!receiptData) return;

    const newDoc: DocumentRecord = {
      id: receiptData.evidenceId,
      caseId: receiptData.caseId,
      caseNumber: receiptData.caseNumber,
      name: receiptData.title,
      category,
      version: '1.0',
      classification,
      fileSizeBytes: receiptData.fileSizeBytes,
      mimeType: receiptData.mimeType,
      uploadedBy: 'Inspector Vikram Rathore',
      uploadedAt: receiptData.createdAt,
      integrityStatus: 'VERIFIED',
      status: 'APPROVED',
      currentCustodian: 'Central Crime Branch Ingestion Vault',
      sha256Plaintext: receiptData.sha256Plaintext,
      sha256Ciphertext: receiptData.sha256Ciphertext,
      merkleLeafHash: receiptData.merkleLeafHash,
      checkpointSequence: receiptData.checkpointSequence,
    };

    onDocumentCreated(newDoc);
    handleModalClose();
  };

  const handleCopyProof = () => {
    if (!receiptData) return;
    const proofJson = JSON.stringify(receiptData, null, 2);
    navigator.clipboard.writeText(proofJson);
    info('Cryptographic Proof Copied', 'Raw receipt copied to clipboard in JSON format.');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        stage === 'RECEIPT'
          ? 'Cryptographic Evidence Ingestion Receipt'
          : stage === 'PIPELINE'
          ? 'Zero-Trust Cryptographic Pipeline Active'
          : 'Secure Evidence Ingestion & Cryptographic Registration'
      }
      description={
        stage === 'RECEIPT'
          ? 'Digital custody registered with verified AES-256-GCM envelope and Merkle anchor.'
          : stage === 'PIPELINE'
          ? 'Computing zero-trust cryptographic chain: Digest calculation, AES-256-GCM encryption, and ledger anchoring.'
          : 'Zero-Trust pipeline: Validates case assignment, encrypts payload via AES-256-GCM, and commits SHA-256 leaf to the Merkle ledger.'
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          {stage === 'FORM' && (
            <>
              <Button variant="secondary" size="sm" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!uploadedFile || !selectedCaseId}
                onClick={handleStartIngestion}
              >
                Complete Ingestion Receipt
              </Button>
            </>
          )}

          {stage === 'PIPELINE' && errorMessage && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStage('FORM')}
              >
                Back to Form
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleStartIngestion}
              >
                Retry Ingestion
              </Button>
            </>
          )}

          {stage === 'RECEIPT' && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Copy className="w-3.5 h-3.5" />}
                onClick={handleCopyProof}
              >
                Copy Proof
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinishReceipt}
              >
                Done
              </Button>
            </>
          )}
        </div>
      }
    >
      <AnimatePresence mode="wait">
        {stage === 'FORM' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Case Assignment"
                options={cases.map((c) => ({
                  value: c.id,
                  label: `${c.caseNumber} (${c.title})`,
                }))}
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              />

              <Select
                label="Evidence Category"
                options={[
                  { value: 'DIGITAL_EVIDENCE', label: 'Digital Evidence / Binary Artifact' },
                  { value: 'FIR', label: 'First Information Report (FIR)' },
                  { value: 'FORENSIC_REPORT', label: 'Forensic Lab Examination Report' },
                  { value: 'WITNESS_STATEMENT', label: 'Witness Statement / Deposition' },
                ]}
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Document / Artifact Label"
                placeholder="e.g. CCTV_Footage_ServerRoom_1080p.mp4"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />

              <Select
                label="ABAC Security Classification"
                options={[
                  { value: 'RESTRICTED', label: 'RESTRICTED' },
                  { value: 'CONFIDENTIAL', label: 'CONFIDENTIAL' },
                  { value: 'SECRET', label: 'SECRET' },
                  { value: 'TOP_SECRET', label: 'TOP SECRET (Restricted Air-Gapped)' },
                ]}
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                Select or Drop Raw Evidence File
              </label>
              <FileUpload onFileAccepted={handleFileAccepted} />
            </div>
          </motion.div>
        )}

        {stage === 'PIPELINE' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-3 py-1"
          >
            {errorMessage && (
              <Alert variant="danger" title="Cryptographic Pipeline Interrupted">
                {errorMessage}
              </Alert>
            )}

            <div className="space-y-2.5">
              {steps.map((step) => {
                const isFailed = step.status === 'FAILED';
                const isActive = step.status === 'ACTIVE';
                const isCompleted = step.status === 'COMPLETED';

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isFailed
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : isActive
                        ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-[var(--surface-elevated)] border-[var(--border)] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                          {step.icon}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-2">
                            <span>Step {step.id}: {step.label}</span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-mono">
                                <Loader2 className="w-3 h-3 animate-spin" /> Processing
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                                <CheckCircle2 className="w-3 h-3" /> Authenticated
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono">
                                <AlertTriangle className="w-3 h-3" /> Error
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {step.description}
                          </div>
                        </div>
                      </div>

                      {step.previewValue && (
                        <div className="font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)] max-w-[200px] truncate select-all">
                          {step.previewValue}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {stage === 'RECEIPT' && receiptData && (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400">
                  Cryptographic Registration Verified
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Artifact encrypted with AES-256-GCM and committed to Merkle Checkpoint #{receiptData.checkpointSequence}.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                  Artifact Identifier
                </span>
                <div className="font-mono text-[12px] text-[var(--text-primary)] font-medium">
                  {receiptData.evidenceId}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate">
                  {receiptData.title}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                  Assigned Case & Sequence
                </span>
                <div className="font-mono text-[12px] text-[var(--text-primary)] font-medium">
                  {receiptData.caseNumber}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  Merkle Block Sequence #{receiptData.checkpointSequence}
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)]">
              <div className="text-[11px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Cryptographic Proof Attributes</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Plaintext SHA-256:</span>
                  <HashDisplay hash={receiptData.sha256Plaintext} truncateLength={8} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Ciphertext SHA-256:</span>
                  <HashDisplay hash={receiptData.sha256Ciphertext} truncateLength={8} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Merkle Leaf Digest:</span>
                  <HashDisplay hash={receiptData.merkleLeafHash} truncateLength={8} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">GCM Initial Vector (IV):</span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--surface-active)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {receiptData.iv}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Authentication Tag:</span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] bg-[var(--surface-active)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {receiptData.authTag}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
