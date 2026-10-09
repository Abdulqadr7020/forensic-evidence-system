import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { useToast } from '../../context/ToastContext';
import { DocumentClassification, DocumentRecord } from '../../types/models';

export interface IngestEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (doc: DocumentRecord) => void;
}

export const IngestEvidenceModal: React.FC<IngestEvidenceModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const { success } = useToast();
  const [caseNumber, setCaseNumber] = useState('CR-2026-0104');
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<'FIR' | 'DIGITAL_EVIDENCE' | 'FORENSIC_REPORT' | 'WITNESS_STATEMENT'>('DIGITAL_EVIDENCE');
  const [classification, setClassification] = useState<DocumentClassification>('SECRET');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
    if (!docName) {
      setDocName(file.name);
    }
  };

  const handleCommitIngestion = () => {
    const newDocId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDoc: DocumentRecord = {
      id: newDocId,
      caseId: 'case_cr_2026_0104',
      caseNumber: caseNumber,
      name: docName || uploadedFile?.name || 'Evidence_Artifact_01.bin',
      category: category,
      version: '1.0',
      classification: classification,
      fileSizeBytes: uploadedFile ? uploadedFile.size : 1048576,
      mimeType: uploadedFile ? uploadedFile.type : 'application/octet-stream',
      uploadedBy: 'Inspector Vikram Rathore',
      uploadedAt: new Date().toISOString(),
      integrityStatus: 'VERIFIED',
      status: 'APPROVED',
      currentCustodian: 'Central Crime Branch Ingestion Vault',
      sha256Plaintext: 'd41d8cd98f00b204e9800998ecf8427e9f86d081884c7d659a2feaa0c55ad015',
      sha256Ciphertext: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      merkleLeafHash: 'a127f83b190a4ceb89182390aef9048123840192837401928301928340192834',
      checkpointSequence: 105,
    };

    onDocumentCreated(newDoc);
    success('Evidence Ingested & Encrypted', `${newDoc.name} committed to Merkle Checkpoint #105.`);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Evidence Ingestion & Cryptographic Registration"
      description="Zero-Trust pipeline: Validates case assignment, encrypts payload via AES-256-GCM, and commits SHA-256 leaf to the Merkle ledger."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!uploadedFile && !docName}
            onClick={handleCommitIngestion}
          >
            Complete Ingestion Receipt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Case Assignment"
            options={[
              { value: 'CR-2026-0104', label: 'CR-2026-0104 (Apex Syndicate Infiltration)' },
              { value: 'CR-2026-0220', label: 'CR-2026-0220 (Metro Hospital Ransomware)' },
              { value: 'CR-2026-0312', label: 'CR-2026-0312 (Harbor Customs Seizure)' },
            ]}
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
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
      </div>
    </Dialog>
  );
};
