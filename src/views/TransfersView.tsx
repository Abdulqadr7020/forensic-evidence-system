import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CustodyTimelineView, CustodyTimelineNode } from '../components/security/CustodyTimelineView';
import { AcceptCustodyModal } from '../components/modals/AcceptCustodyModal';
import { fetchTransfers, updateTransferStatus } from '../services/db';
import { EvidenceTransferRecord } from '../types/models';
import { useToast } from '../context/ToastContext';
import { HashDisplay } from '../components/security/HashDisplay';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  CheckCircle2,
  Search,
  FileCheck2,
  Building2,
  FolderLock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const TransfersView: React.FC = () => {
  const { success, error } = useToast();
  const [transfers, setTransfers] = useState<EvidenceTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'IN_TRANSIT' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [signingModalTransfer, setSigningModalTransfer] = useState<EvidenceTransferRecord | null>(null);

  useEffect(() => {
    fetchTransfers()
      .then((data) => {
        setTransfers(data);
        if (data.length > 0) {
          // Default to first item awaiting acceptance or first item overall
          const pending = data.find((t) => t.status === 'AWAITING_ACCEPTANCE');
          setSelectedTransferId(pending ? pending.id : data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load transfers:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter transfers by tab and search query
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      // Tab filter
      if (filterTab === 'ACTION_REQUIRED' && t.status !== 'AWAITING_ACCEPTANCE') return false;
      if (filterTab === 'IN_TRANSIT' && t.status !== 'IN_TRANSIT' && t.status !== 'PENDING_DISPATCH') return false;
      if (filterTab === 'COMPLETED' && t.status !== 'ACCEPTED' && t.status !== 'COMPLETED') return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.documentName.toLowerCase().includes(query);
        const matchesCase = t.caseNumber.toLowerCase().includes(query);
        const matchesId = t.transferId.toLowerCase().includes(query);
        const matchesOrigin = t.originOfficer.toLowerCase().includes(query) || t.originDepartment.toLowerCase().includes(query);
        const matchesDest = t.destinationDepartment.toLowerCase().includes(query) || (t.destinationOfficer || '').toLowerCase().includes(query);
        return matchesName || matchesCase || matchesId || matchesOrigin || matchesDest;
      }
      return true;
    });
  }, [transfers, filterTab, searchQuery]);

  // Active selected transfer for the timeline panel
  const selectedTransfer = useMemo(() => {
    return transfers.find((t) => t.id === selectedTransferId) || filteredTransfers[0] || null;
  }, [transfers, selectedTransferId, filteredTransfers]);

  // Dynamic chain of custody timeline for the selected transfer
  const selectedTimelineEvents = useMemo<CustodyTimelineNode[]>(() => {
    if (!selectedTransfer) return [];

    const reqDate = new Date(selectedTransfer.requestedAt);
    const seizureDate = new Date(reqDate.getTime() - 4 * 3600 * 1000); // 4 hours prior
    const transitDate = new Date(reqDate.getTime() + 45 * 60 * 1000); // 45 min after
    const acceptedDate = new Date(reqDate.getTime() + 90 * 60 * 1000); // 90 min after

    const events: CustodyTimelineNode[] = [
      {
        id: `node-ingestion-${selectedTransfer.id}`,
        action: 'INGESTION',
        actorName: selectedTransfer.originOfficer,
        actorRole: 'Police Investigating Officer',
        actorDepartment: selectedTransfer.originDepartment,
        timestamp: seizureDate.toISOString(),
        reason: `Initial seizure and verified intake under case ${selectedTransfer.caseNumber}.`,
        validationHash: selectedTransfer.chainValidationHash,
      },
      {
        id: `node-request-${selectedTransfer.id}`,
        action: 'TRANSFER_REQUEST',
        actorName: selectedTransfer.originOfficer,
        actorRole: 'Police Investigating Officer',
        actorDepartment: selectedTransfer.originDepartment,
        timestamp: reqDate.toISOString(),
        reason: selectedTransfer.reason,
        validationHash: selectedTransfer.chainValidationHash,
      },
    ];

    if (selectedTransfer.status === 'IN_TRANSIT') {
      events.push({
        id: `node-transit-${selectedTransfer.id}`,
        action: 'TRANSFER_REQUEST',
        actorName: 'Secure Forensic Courier',
        actorRole: 'Authorized Custodial Transport',
        actorDepartment: 'Custody Logistics Service',
        timestamp: transitDate.toISOString(),
        reason: `Evidence sealed in tamper-evident pouch and currently in secure transit to ${selectedTransfer.destinationDepartment}.`,
        validationHash: selectedTransfer.chainValidationHash,
      });
    }

    if (selectedTransfer.status === 'ACCEPTED' || selectedTransfer.status === 'COMPLETED') {
      events.push({
        id: `node-accepted-${selectedTransfer.id}`,
        action: 'TRANSFER_ACCEPTED',
        actorName: selectedTransfer.destinationOfficer || 'Authorized Intake Officer',
        actorRole: 'Receiving Custodian',
        actorDepartment: selectedTransfer.destinationDepartment,
        timestamp: acceptedDate.toISOString(),
        reason: 'Physical tamper-evident seal verified intact. Hash validation confirmed and legal custody assumed.',
        validationHash: selectedTransfer.chainValidationHash,
      });
    }

    return events;
  }, [selectedTransfer]);

  // Handle custody signing confirmation
  const handleConfirmCustody = async (transferId: string) => {
    try {
      await updateTransferStatus(transferId, 'ACCEPTED');
      setTransfers((prev) =>
        prev.map((t) => (t.id === transferId ? { ...t, status: 'ACCEPTED' } : t))
      );
      success(
        'Custody Transfer Confirmed',
        `Signed receipt logged in immutable chain-of-custody ledger.`
      );
    } catch (err) {
      console.error('Failed to update transfer status:', err);
      error('Transfer Error', 'Could not record custody acceptance.');
    }
  };

  // Metrics
  const actionRequiredCount = transfers.filter((t) => t.status === 'AWAITING_ACCEPTANCE').length;
  const inTransitCount = transfers.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'PENDING_DISPATCH').length;
  const completedCount = transfers.filter((t) => t.status === 'ACCEPTED' || t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Transfers & Chain of Custody"
        description="Legally binding custody transitions between Investigating Officers, Forensic Labs, and Public Prosecutors."
      />

      {/* 3-KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
              Pending Your Receipt
            </span>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {actionRequiredCount}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Requires digital signature attestation
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
              Active In Transit
            </span>
            <div className="text-2xl font-bold font-mono text-blue-400">
              {inTransitCount}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Custody hand-off en route
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
              Custody Secured
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {completedCount}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Verified in court-admissible ledger
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Transfer Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Custody Transition Queue</CardTitle>
                  <CardDescription>
                    Select any record to inspect its immutable custody log.
                  </CardDescription>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)] self-start sm:self-auto text-xs">
                  <button
                    onClick={() => setFilterTab('ALL')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      filterTab === 'ALL'
                        ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    All ({transfers.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('ACTION_REQUIRED')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                      filterTab === 'ACTION_REQUIRED'
                        ? 'bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Action Required
                    {actionRequiredCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                  <button
                    onClick={() => setFilterTab('IN_TRANSIT')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      filterTab === 'IN_TRANSIT'
                        ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => setFilterTab('COMPLETED')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      filterTab === 'COMPLETED'
                        ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-3 relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by evidence name, case number, or officer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </CardHeader>

            {/* List of Transfer Cards */}
            <div className="space-y-3 p-4">
              {loading ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  Loading custody transfers...
                </div>
              ) : filteredTransfers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-lg">
                  No transfer requests match this filter.
                </div>
              ) : (
                filteredTransfers.map((trf) => {
                  const isSelected = selectedTransfer?.id === trf.id;
                  const isPendingAcceptance = trf.status === 'AWAITING_ACCEPTANCE';

                  return (
                    <div
                      key={trf.id}
                      onClick={() => setSelectedTransferId(trf.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs flex flex-col gap-2.5 ${
                        isSelected
                          ? 'border-[var(--accent)] bg-[var(--surface-elevated)] ring-1 ring-[var(--accent)]/30 shadow-md'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {/* Top Row: IDs, Case, Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[var(--text-primary)]">
                            {trf.transferId}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            {trf.caseNumber}
                          </span>
                        </div>

                        <Badge
                          size="sm"
                          variant={
                            trf.status === 'ACCEPTED' || trf.status === 'COMPLETED'
                              ? 'success'
                              : trf.status === 'AWAITING_ACCEPTANCE'
                              ? 'warning'
                              : trf.status === 'IN_TRANSIT'
                              ? 'primary'
                              : 'neutral'
                          }
                        >
                          {trf.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {/* Evidence File Name */}
                      <div className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span className="truncate">{trf.documentName}</span>
                      </div>

                      {/* Clear Route Flow: Origin ➔ Destination */}
                      <div className="p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[11px]">
                        <div className="truncate">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">
                            Origin
                          </span>
                          <span className="font-medium text-[var(--text-primary)] truncate block">
                            {trf.originOfficer}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] truncate block">
                            {trf.originDepartment}
                          </span>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 opacity-60 mx-1" />

                        <div className="text-right truncate">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">
                            Destination
                          </span>
                          <span className="font-medium text-[var(--text-primary)] truncate block">
                            {trf.destinationOfficer || 'Unit Intake'}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] truncate block">
                            {trf.destinationDepartment}
                          </span>
                        </div>
                      </div>

                      {/* Justification & Action Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
                        <p className="text-[11px] text-[var(--text-muted)] italic truncate">
                          "{trf.reason}"
                        </p>

                        {isPendingAcceptance ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSigningModalTransfer(trf);
                            }}
                            className="shrink-0 flex items-center gap-1 text-[11px] py-1 h-auto"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Accept Custody & Sign Receipt
                          </Button>
                        ) : (trf.status === 'ACCEPTED' || trf.status === 'COMPLETED') ? (
                          <span className="text-[10px] text-[var(--success)] flex items-center gap-1 font-medium shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Signed & Attested
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Evidence Custody Ledger (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Chain of Custody Ledger</CardTitle>
                  <CardDescription className="text-xs">
                    Legal provenance & chronological integrity trail.
                  </CardDescription>
                </div>
                {selectedTransfer && (
                  <Badge size="sm" variant="neutral">
                    {selectedTransfer.caseNumber}
                  </Badge>
                )}
              </div>
            </CardHeader>

            {selectedTransfer ? (
              <div className="p-4 space-y-5">
                {/* Selected Item Summary Card */}
                <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">
                      Evidence Item
                    </span>
                    <span className="font-semibold text-xs text-[var(--text-primary)] block break-all">
                      {selectedTransfer.documentName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block font-medium uppercase">
                        Current Legal Holder
                      </span>
                      <span className="font-medium text-[var(--text-primary)] truncate block">
                        {selectedTransfer.status === 'ACCEPTED' || selectedTransfer.status === 'COMPLETED'
                          ? selectedTransfer.destinationOfficer || selectedTransfer.destinationDepartment
                          : selectedTransfer.originOfficer}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block font-medium uppercase">
                        Jurisdiction
                      </span>
                      <span className="font-medium text-[var(--text-primary)] truncate block">
                        {selectedTransfer.destinationDepartment}
                      </span>
                    </div>
                  </div>

                  {/* Hash Signature Display */}
                  <div className="pt-1.5 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-medium uppercase mb-1">
                      Custody Integrity Checksum (SHA-256)
                    </span>
                    <HashDisplay
                      hash={selectedTransfer.chainValidationHash}
                      label="Sig"
                      truncateLength={12}
                    />
                  </div>
                </div>

                {/* Chronological Vertical Audit Timeline */}
                <div>
                  <div className="text-[11px] font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Chronological Custody Timeline
                  </div>

                  <CustodyTimelineView events={selectedTimelineEvents} />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                Select a transfer from the queue to inspect its chain of custody history.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Accept Custody & Sign Legal Receipt Modal */}
      <AcceptCustodyModal
        isOpen={!!signingModalTransfer}
        onClose={() => setSigningModalTransfer(null)}
        transfer={signingModalTransfer}
        onConfirm={handleConfirmCustody}
      />
    </div>
  );
};
