import React from 'react';
import { ArrowLeftRight, CheckCircle2, Shield, Upload, FileText, UserCheck } from 'lucide-react';
import { HashDisplay } from './HashDisplay';

export interface CustodyTimelineNode {
  id: string;
  action: 'INGESTION' | 'TRANSFER_REQUEST' | 'TRANSFER_ACCEPTED' | 'EXAMINATION_STARTED' | 'REPORT_SUBMITTED' | 'ARCHIVED';
  actorName: string;
  actorRole: string;
  actorDepartment: string;
  timestamp: string;
  reason?: string;
  validationHash: string;
}

export interface CustodyTimelineViewProps {
  events: CustodyTimelineNode[];
}

export const CustodyTimelineView: React.FC<CustodyTimelineViewProps> = ({ events }) => {
  const getIcon = (action: CustodyTimelineNode['action']) => {
    switch (action) {
      case 'INGESTION':
        return <Upload className="w-3.5 h-3.5" />;
      case 'TRANSFER_REQUEST':
        return <ArrowLeftRight className="w-3.5 h-3.5" />;
      case 'TRANSFER_ACCEPTED':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'EXAMINATION_STARTED':
        return <Shield className="w-3.5 h-3.5" />;
      case 'REPORT_SUBMITTED':
        return <FileText className="w-3.5 h-3.5" />;
      case 'ARCHIVED':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border)]">
      {events.map((event) => (
        <div key={event.id} className="relative flex flex-col gap-1.5 text-xs">
          {/* Node marker */}
          <div className="absolute -left-[27px] top-0.5 p-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-secondary)]">
            {getIcon(event.action)}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              {event.action.replace(/_/g, ' ')}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {new Date(event.timestamp).toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-[var(--text-secondary)]">
            Custodian: <span className="font-medium text-[var(--text-primary)]">{event.actorName}</span>{' '}
            ({event.actorRole} · {event.actorDepartment})
          </div>

          {event.reason && (
            <p className="text-[11px] text-[var(--text-muted)] bg-[var(--surface)] p-2 rounded border border-[var(--border-subtle)]">
              Justification: {event.reason}
            </p>
          )}

          <div className="mt-0.5">
            <HashDisplay hash={event.validationHash} label="Custody Sig" truncateLength={8} />
          </div>
        </div>
      ))}
    </div>
  );
};
