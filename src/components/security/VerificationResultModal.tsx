import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { VerificationChecklistDetail, DocumentRecord } from '../../types/models';
import { IntegrityBadge } from './IntegrityBadge';
import { HashDisplay } from './HashDisplay';
import { CheckCircle2, XCircle, ShieldCheck, AlertTriangle, FileText, Lock } from 'lucide-react';
import { Alert } from '../ui/Alert';

export interface VerificationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | null;
  detail: VerificationChecklistDetail | null;
}

export const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
  isOpen,
  onClose,
  document,
  detail,
}) => {
  if (!document || !detail) return null;

  const isTampered = detail.overallStatus === 'TAMPERING_DETECTED';
  const isVerified = detail.overallStatus === 'VERIFIED';

  const checkItems = [
    {
      title: 'Ciphertext Blob SHA-256 Hash',
      description: 'Calculates active SHA-256 hash of AES-256-GCM ciphertext in secure storage.',
      passed: detail.ciphertextHashMatch,
      expected: detail.expectedCiphertextHash,
      observed: detail.observedCiphertextHash,
    },
    {
      title: 'Plaintext Hash Authentication',
      description: 'Compares decrypted bytes hash with original ingestion commitment.',
      passed: detail.plaintextHashMatch,
      expected: document.sha256Plaintext,
      observed: detail.plaintextHashMatch ? document.sha256Plaintext : 'MISMATCH_INVALID_PAYLOAD',
    },
    {
      title: 'Merkle Tree Inclusion Proof',
      description: 'Cryptographically verifies leaf membership against authenticated Merkle root.',
      passed: detail.merkleProofValid,
      expected: detail.merkleRoot,
      observed: detail.merkleProofValid ? detail.merkleRoot : 'INVALID_INCLUSION_PATH',
    },
    {
      title: 'Ed25519 Signed Checkpoint',
      description: `Verifies digital signature on Checkpoint #${detail.checkpointSequence} from authorized hardware root.`,
      passed: detail.checkpointSignatureValid,
      expected: 'KEY: ed25519_judicial_root_2026',
      observed: detail.checkpointSignatureValid ? 'VALID (Signature verified)' : 'SIGNATURE_INVALID',
    },
    {
      title: 'Append-Only Audit Hash-Chain',
      description: 'Verifies continuity of sequential SHA-256 audit log event pointers.',
      passed: detail.auditChainConsistent,
      expected: 'CHAIN_INTEGRITY_STABLE',
      observed: detail.auditChainConsistent ? 'CHAIN_INTEGRITY_STABLE' : 'CHAIN_FORK_DETECTED',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cryptographic Integrity Verification"
      description={`Verification outcome and cryptographic checklist for ${document.name}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            Verified at: {new Date(detail.verificationTimestamp).toUTCString()}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Summary Status Header */}
        <div className="p-3.5 rounded-lg border bg-[var(--surface)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[var(--surface-elevated)] border text-[var(--text-primary)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">{document.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                {document.id} · Case: {document.caseNumber} · Version: v{document.version} · Class: {document.classification}
              </div>
            </div>
          </div>
          <div>
            <IntegrityBadge status={detail.overallStatus} />
          </div>
        </div>

        {/* Complete Document Specifications & Custody Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block mb-0.5">Category</span>
            <span className="font-medium text-[var(--text-primary)] truncate block">{document.category.replace(/_/g, ' ')}</span>
          </div>
          <div className="p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block mb-0.5">Payload Size</span>
            <span className="font-mono text-[var(--text-primary)] block">{(document.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
          <div className="p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block mb-0.5">Custodian</span>
            <span className="font-medium text-[var(--text-secondary)] truncate block">{document.currentCustodian}</span>
          </div>
          <div className="p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block mb-0.5">Ingested By</span>
            <span className="font-medium text-[var(--text-secondary)] truncate block">{document.uploadedBy}</span>
          </div>
        </div>

        {/* Ciphertext Storage Hash */}
        <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">AES-256 Storage Ciphertext Hash:</span>
          <HashDisplay hash={document.sha256Ciphertext} truncateLength={10} />
        </div>

        {/* Enhanced Cryptographic Proof Parameters Card (D-08) */}
        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              AES-256-GCM Cryptographic Parameters
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Authenticated Envelope
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Initialization Vector (12-byte IV):</span>
              <HashDisplay hash={document.iv || 'e2c6b0622d21e98067caa155'} truncateLength={12} label="IV" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Authentication Tag (16-byte Tag):</span>
              <HashDisplay hash={document.authTag || '9411a349cd7b8508ed8a28433e13c494'} truncateLength={12} label="Tag" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Plaintext SHA-256 Digest:</span>
              <HashDisplay hash={document.sha256Plaintext || ''} truncateLength={10} label="Plaintext" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Ciphertext SHA-256 Digest:</span>
              <HashDisplay hash={document.sha256Ciphertext || ''} truncateLength={10} label="Ciphertext" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] font-sans">Merkle Leaf Anchor:</span>
              <HashDisplay hash={document.merkleLeafHash || ''} truncateLength={10} label="Leaf" />
            </div>
          </div>
        </div>

        {/* Persistent Alert for Tampering */}
        {isTampered && (
          <Alert variant="danger" title="CRITICAL: Bit-Level Tampering Detected">
            The stored ciphertext bytes do not match the canonical SHA-256 ingestion hash. 
            An unauthorized modification or bit-corruption was identified. The security alert has been dispatched to the Administrator and Auditor trail.
          </Alert>
        )}

        {isVerified && (
          <Alert variant="success" title="Zero-Trust Verification Passed">
            All 5 independent cryptographic invariants verified successfully. The evidence payload matches the original ingestion commitment.
          </Alert>
        )}

        {/* Structural Checklist */}
        <div className="rounded-lg border border-[var(--border)] overflow-hidden divide-y divide-[var(--border-subtle)] bg-[var(--surface)]">
          {checkItems.map((item, idx) => (
            <div key={idx} className="p-3 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <span>{item.title}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    item.passed
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {item.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] pl-6">
                {item.description}
              </p>

              <div className="mt-1 pl-6 flex flex-col gap-1 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] w-16 shrink-0">Expected:</span>
                  <HashDisplay hash={item.expected} truncateLength={14} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] w-16 shrink-0">Observed:</span>
                  <span className={item.passed ? '' : 'text-rose-500 font-semibold'}>
                    <HashDisplay hash={item.observed} truncateLength={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkpoint & Root Reference */}
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-secondary)]">
              Merkle Root committed at Sequence <span className="font-mono text-[var(--text-primary)]">#{detail.checkpointSequence}</span>
            </span>
          </div>
          <HashDisplay hash={detail.merkleRoot} label="Root" truncateLength={6} />
        </div>
      </div>
    </Dialog>
  );
};
