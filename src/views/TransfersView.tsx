import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CustodyTimelineView, CustodyTimelineNode } from '../components/security/CustodyTimelineView';
import { fetchTransfers } from '../services/db';
import { EvidenceTransferRecord } from '../types/models';
import { useToast } from '../context/ToastContext';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const TransfersView: React.FC = () => {
  const { success } = useToast();
  const [transfers, setTransfers] = useState<EvidenceTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchTransfers()
      .then((data) => setTransfers(data))
      .finally(() => setLoading(false));
  }, []);

  const mockTimelineEvents: CustodyTimelineNode[] = [
    {
      id: 'node-1',
      action: 'INGESTION',
      actorName: 'Inspector Vikram Rathore',
      actorRole: 'Police Investigating Officer',
      actorDepartment: 'Central Crime Branch (Division 4)',
      timestamp: '2026-10-08T14:30:00Z',
      reason: 'Physical seizure of external encrypted solid-state disk during raid.',
      validationHash: '4a1b025687a4192b67f139048a1c97ef8b898a123f18b63991f893d56efb9a4c',
    },
    {
      id: 'node-2',
      action: 'TRANSFER_REQUEST',
      actorName: 'Inspector Vikram Rathore',
      actorRole: 'Police Investigating Officer',
      actorDepartment: 'Central Crime Branch (Division 4)',
      timestamp: '2026-10-08T15:00:00Z',
      reason: 'Dispatch to Digital Forensics & Cryptanalysis Lab for decryption analysis.',
      validationHash: 'c7401928301928340192834a127f83b190a4ce8b9182390aef90481238401928',
    },
    {
      id: 'node-3',
      action: 'TRANSFER_ACCEPTED',
      actorName: 'Dr. Evelyn Vance, PhD',
      actorRole: 'Forensic Lab Lead',
      actorDepartment: 'Digital Forensics & Cryptanalysis Lab',
      timestamp: '2026-10-08T15:45:00Z',
      reason: 'Physical tamper-evident envelope seal verified intact. Vault intake committed.',
      validationHash: '8b9182390aef9048123840192837401928301928340192834a127f83b190a4ce',
    },
    {
      id: 'node-4',
      action: 'EXAMINATION_STARTED',
      actorName: 'Dr. Evelyn Vance, PhD',
      actorRole: 'Forensic Lab Lead',
      actorDepartment: 'Digital Forensics & Cryptanalysis Lab',
      timestamp: '2026-10-08T16:00:00Z',
      reason: 'Bit-stream image extraction into air-gapped forensics station.',
      validationHash: '340192834a127f83b190a4ce8b9182390aef9048123840192837401928301928',
    },
  ];

  const handleAccept = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'ACCEPTED' } : t))
    );
    success('Custody Transfer Confirmed', `Signed receipt logged in chain of custody ledger.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Transfers"
        description="Custody transitions between Investigating Officers, Forensic Laboratories, and Public Prosecutors."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Requests Queue</CardTitle>
              <CardDescription>
                Transfers require explicit digital signature attestation upon receipt.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3">
              {transfers.map((trf) => (
                <div
                  key={trf.id}
                  className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {trf.transferId}
                    </span>
                    <Badge
                      size="sm"
                      variant={trf.status === 'ACCEPTED' ? 'success' : 'warning'}
                    >
                      {trf.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <p className="font-semibold text-xs text-[var(--text-primary)]">
                    {trf.documentName}
                  </p>

                  <div className="text-[11px] text-[var(--text-muted)] grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div>Origin: {trf.originDepartment} ({trf.originOfficer})</div>
                    <div>Destination: {trf.destinationDepartment}</div>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface)] p-2 rounded border border-[var(--border-subtle)] italic">
                    Reason: "{trf.reason}"
                  </p>

                  {trf.status === 'AWAITING_ACCEPTANCE' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAccept(trf.id)}
                      >
                        Accept Custody & Sign Receipt
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Chain of Custody Audit Timeline</CardTitle>
              <CardDescription>
                Chronological sequence for Case CR-2026-0104.
              </CardDescription>
            </CardHeader>
            <CustodyTimelineView events={mockTimelineEvents} />
          </Card>
        </div>
      </div>
    </div>
  );
};
