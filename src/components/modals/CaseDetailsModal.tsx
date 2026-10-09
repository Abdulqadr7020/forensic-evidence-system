import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CaseRecord } from '../../types/models';
import { FolderLock, Calendar, UserCheck, Shield } from 'lucide-react';

export interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseRecord: CaseRecord | null;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  caseRecord,
}) => {
  if (!caseRecord) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Case Dossier: ${caseRecord.caseNumber}`}
      description="Zero-Trust investigative dossier and attribute-based access policy boundaries."
      maxWidth="md"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close Dossier
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
              {caseRecord.caseNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <Badge size="sm" variant={caseRecord.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {caseRecord.status}
              </Badge>
              <Badge size="sm" variant={caseRecord.classification === 'TOP_SECRET' ? 'danger' : 'warning'}>
                {caseRecord.classification}
              </Badge>
            </div>
          </div>
          <p className="text-xs font-medium text-[var(--text-primary)]">{caseRecord.title}</p>
          <p className="text-[11px] text-[var(--text-muted)]">{caseRecord.crimeCategory}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block mb-1">
              Assigned Department
            </span>
            <span className="text-[var(--text-primary)] font-medium">
              {caseRecord.assignedDepartment}
            </span>
          </div>

          <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block mb-1">
              Investigating Officer
            </span>
            <span className="text-[var(--text-primary)] font-medium">
              {caseRecord.investigatingOfficerName}
            </span>
          </div>

          <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block mb-1">
              Registered Evidence Items
            </span>
            <span className="text-[var(--text-primary)] font-mono font-medium">
              {caseRecord.documentCount} items committed
            </span>
          </div>

          <div className="p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
            <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block mb-1">
              Last Case Activity
            </span>
            <span className="text-[var(--text-primary)] font-mono text-[11px]">
              {new Date(caseRecord.lastActivityAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
