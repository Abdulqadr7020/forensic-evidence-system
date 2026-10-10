import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { DocumentRecord } from '../../types/models';
import { ShieldAlert, AlertTriangle, Lock, FileWarning } from 'lucide-react';

export interface TamperAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecord | null;
  errorMessage?: string;
}

export const TamperAlertModal: React.FC<TamperAlertModalProps> = ({
  isOpen,
  onClose,
  document,
  errorMessage,
}) => {
  if (!document) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="CRITICAL SECURITY ALERT: Tamper Detected"
      description="Zero-Trust Cryptographic Invariant Failure: Authenticated decryption was aborted."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-rose-400 font-mono">
            STATUS: INTEGRITY_VIOLATION_L3
          </span>
          <Button variant="destructive" size="sm" onClick={onClose}>
            Acknowledge & Dismiss
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Urgent warning banner */}
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-400">
              AES-256-GCM Poly1305 Tag Mismatch
            </h4>
            <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
              {errorMessage ||
                'Ciphertext bitstream verification failed. The stored authentication tag does not match the computed digest for this encrypted payload.'}
            </p>
          </div>
        </div>

        {/* Affected evidence summary */}
        <div className="p-3.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Evidence Artifact:</span>
            <span className="font-medium text-[var(--text-primary)]">{document.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Evidence Identifier:</span>
            <span className="font-mono text-[var(--text-secondary)]">{document.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Case Reference:</span>
            <span className="font-mono text-[var(--text-secondary)]">{document.caseNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Chain Invariant:</span>
            <span className="text-rose-400 font-mono font-semibold">AUTHENTICATION_TAG_INVALID</span>
          </div>
        </div>

        {/* Action Taken note */}
        <div className="p-3 rounded-lg bg-black/40 border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Forensic Protection Protocol Active</span>
          </div>
          <p>
            Decrypted plaintext file streaming was terminated immediately. The raw file bytes have not been written to your local disk to prevent execution of tampered payloads.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
