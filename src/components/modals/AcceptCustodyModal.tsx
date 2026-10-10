import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceTransferRecord } from '../../types/models';
import { HashDisplay } from '../security/HashDisplay';
import { ShieldCheck, ArrowRight, UserCheck, CheckCircle2, Lock } from 'lucide-react';

export interface AcceptCustodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: EvidenceTransferRecord | null;
  onConfirm: (transferId: string) => Promise<void> | void;
}

export const AcceptCustodyModal: React.FC<AcceptCustodyModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onConfirm,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmedIntegrity, setConfirmedIntegrity] = useState(false);

  if (!transfer) return null;

  const handleConfirm = async () => {
    setIsVerifying(true);
    try {
      await onConfirm(transfer.id);
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Accept Custody & Sign Legal Receipt"
      description="Formal legal attestation of custodial possession under chain-of-custody protocols."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!confirmedIntegrity || isVerifying}
            className="flex items-center gap-1.5"
          >
            {isVerifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing Attestation...
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Sign & Assume Legal Custody
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Transfer Header Card */}
        <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[var(--accent)]">
              {transfer.transferId}
            </span>
            <Badge size="sm" variant="warning">
              AWAITING ACCEPTANCE
            </Badge>
          </div>

          <div>
            <div className="font-semibold text-sm text-[var(--text-primary)]">
              {transfer.documentName}
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
              Case Ref: {transfer.caseNumber}
            </div>
          </div>

          {/* Transfer Route Indicator */}
          <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block">
                Dispatched From
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {transfer.originOfficer}
              </span>
              <span className="text-[var(--text-secondary)] block text-[10px]">
                {transfer.originDepartment}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--accent)] shrink-0 mx-2" />

            <div className="text-right">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block">
                Receiving Custodian
              </span>
              <span className="text-[var(--text-primary)] font-medium">
                {transfer.destinationOfficer}
              </span>
              <span className="text-[var(--text-secondary)] block text-[10px]">
                {transfer.destinationDepartment}
              </span>
            </div>
          </div>
        </div>

        {/* Reason / Purpose */}
        <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
          <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block mb-1">
            Custody Transfer Justification
          </span>
          <p className="text-[var(--text-secondary)] italic">
            "{transfer.reason}"
          </p>
        </div>

        {/* Cryptographic Chain Signature */}
        <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-[var(--accent)]" />
              Chain Validation Checksum (SHA-256)
            </span>
            <span className="text-[10px] text-[var(--success)] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Seal Intact
            </span>
          </div>
          <HashDisplay hash={transfer.chainValidationHash} truncateLength={14} />
        </div>

        {/* Attestation Acknowledgment Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] cursor-pointer select-none hover:border-[var(--accent)] transition-colors">
          <input
            type="checkbox"
            checked={confirmedIntegrity}
            onChange={(e) => setConfirmedIntegrity(e.target.checked)}
            className="mt-0.5 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <div className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)] block">
              Legal Custody Acknowledgment
            </span>
            I certify that the physical/digital evidence seal is unbroken, the cryptographic hash matches the original seizure digest, and I am assuming formal legal custody of this item.
          </div>
        </label>
      </div>
    </Dialog>
  );
};
