import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { GlassPanel } from '../components/ui/GlassPanel';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { IntegrityBadge } from '../components/security/IntegrityBadge';
import { HashDisplay } from '../components/security/HashDisplay';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { MetricCardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { VerificationResultModal } from '../components/security/VerificationResultModal';
import { IngestEvidenceModal } from '../components/modals/IngestEvidenceModal';
import { CaseDetailsModal } from '../components/modals/CaseDetailsModal';
import { EvidenceFolderCard } from '../components/ui/EvidenceFolderCard';
import { CaseFolderCard } from '../components/ui/CaseFolderCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FIXTURE_CASES,
  FIXTURE_DOCUMENTS,
  FIXTURE_TRANSFERS,
  FIXTURE_ALERTS,
  getVerificationDetailForDoc,
} from '../data/fixtures';
import { DocumentRecord, SecurityAlertRecord, EvidenceTransferRecord, CaseRecord } from '../types/models';
import {
  ShieldAlert,
  ShieldCheck,
  FolderLock,
  FileCheck2,
  ArrowLeftRight,
  Plus,
  RefreshCw,
  Bug,
  CheckCircle2,
  ExternalLink,
  Lock,
  LayoutGrid,
  List,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { success, warning, info } = useToast();

  // View style modes: folder vs table (default to folder layout as requested)
  const [evidenceViewMode, setEvidenceViewMode] = useState<'folder' | 'table'>('folder');
  const [caseViewMode, setCaseViewMode] = useState<'folder' | 'table'>('folder');

  // Test state mode to verify Normal / Loading / Empty / Error states as required
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal');

  // Active documents & alerts data
  const [documents, setDocuments] = useState<DocumentRecord[]>(FIXTURE_DOCUMENTS);
  const [alerts, setAlerts] = useState<SecurityAlertRecord[]>(FIXTURE_ALERTS);
  const [transfers, setTransfers] = useState<EvidenceTransferRecord[]>(FIXTURE_TRANSFERS);

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [inspectedDoc, setInspectedDoc] = useState<DocumentRecord | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);

  // Document verification modal trigger
  const handleInspectVerification = (doc: DocumentRecord) => {
    setInspectedDoc(doc);
  };

  // Controlled Tampering Simulation Utility (demonstrating the bit-level detector)
  const handleSimulateTampering = () => {
    // Deliberately flip 1 bit in DOC-8801
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === 'DOC-8801') {
          return {
            ...doc,
            integrityStatus: 'TAMPERING_DETECTED',
            sha256Ciphertext: '4a1b025687a4192b67f139048a1c97ef8b898a123f18b63991f893d56efb9a4d', // flipped last hex char 'c' -> 'd'
          };
        }
        return doc;
      })
    );

    const newAlert: SecurityAlertRecord = {
      id: `alert_${Date.now()}`,
      alertType: 'TAMPER_DETECTED',
      severity: 'CRITICAL',
      title: 'Automated Bit-Level Detector: Storage Mismatch on DOC-8801',
      description: 'A 1-bit deviation in stored AES-256-GCM ciphertext was detected. Integrity alert dispatched.',
      resourceId: 'DOC-8801',
      resourceType: 'DOCUMENT',
      timestamp: new Date().toISOString(),
      status: 'OPEN',
      expectedHash: '4a1b025687a4192b67f139048a1c97ef8b898a123f18b63991f893d56efb9a4c',
      observedHash: '4a1b025687a4192b67f139048a1c97ef8b898a123f18b63991f893d56efb9a4d',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    warning(
      'Bit-Level Tampering Detected!',
      'Storage hash mismatch identified on FIR_001_ApexSyndicate. Integrity alert logged.'
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    info('Security Alert Acknowledged', `Alert ${alertId} tagged for forensic audit.`);
  };

  const handleAcceptTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'ACCEPTED' } : t))
    );
    success('Custody Transfer Accepted', `Evidence item receipt registered in chain of custody.`);
  };

  const handleDocumentAdded = (newDoc: DocumentRecord) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Metrics calculation
  const totalCases = FIXTURE_CASES.length;
  const totalDocs = documents.length;
  const pendingTransfers = transfers.filter((t) => t.status === 'AWAITING_ACCEPTANCE').length;
  const verifiedDocsCount = documents.filter((d) => d.integrityStatus === 'VERIFIED').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Main Page Header */}
      <PageHeader
        title="Overview"
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsIngestModalOpen(true)}
          >
            Register Evidence
          </Button>
        }
      />

      {/* Persistent Critical Security Alert Banner if any tampering is open */}
      {activeAlertsCount > 0 && viewState === 'normal' && (
        <Alert
          variant="danger"
          title={`CRITICAL SECURITY EVENT: ${activeAlertsCount} Unresolved Integrity Alert(s)`}
        >
          Automated cryptographic invariant monitor detected a storage hash mismatch. 
          Evidence custody verification has flagged potential bit-corruption or unauthorized modification.
        </Alert>
      )}

      {/* VIEW STATE: LOADING */}
      {viewState === 'loading' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <Card>
            <TableSkeleton rows={4} />
          </Card>
        </div>
      )}

      {/* VIEW STATE: ERROR */}
      {viewState === 'error' && (
        <ErrorState
          title="Cryptographic Ledger Connection Interrupted"
          description="Failed to synchronize signed Merkle checkpoints from the secure hardware module. Operational retry is safe."
          onRetry={() => setViewState('normal')}
        />
      )}

      {/* VIEW STATE: EMPTY */}
      {viewState === 'empty' && (
        <EmptyState
          icon={<FileCheck2 className="w-8 h-8" />}
          title="No Case Evidence Registered in Active Vault"
          description="Your department has no documents pending examination or custody transfer. Ingest a new evidentiary document to begin."
          actionLabel="Register First Evidence Item"
          onAction={() => {
            setViewState('normal');
            setIsIngestModalOpen(true);
          }}
        />
      )}

      {/* VIEW STATE: NORMAL */}
      {viewState === 'normal' && (
        <>
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <MetricCard
              label="Assigned Cases"
              value={totalCases}
              icon={<FolderLock className="w-4 h-4" />}
            />
            <MetricCard
              label="Encrypted Documents"
              value={totalDocs}
              icon={<FileCheck2 className="w-4 h-4" />}
            />
            <MetricCard
              label="Pending Transfers"
              value={pendingTransfers}
              icon={<ArrowLeftRight className="w-4 h-4" />}
              alertBadge={
                pendingTransfers > 0 ? (
                  <Badge variant="warning" size="sm">
                    {pendingTransfers} ACTION
                  </Badge>
                ) : undefined
              }
            />
            <MetricCard
              label="Cryptographically Verified"
              value={verifiedDocsCount}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            />
            <MetricCard
              label="Integrity Alerts"
              value={activeAlertsCount}
              icon={<ShieldAlert className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-rose-500' : 'text-[var(--text-muted)]'}`} />}
              alertBadge={
                activeAlertsCount > 0 ? (
                  <Badge variant="danger" size="sm">
                    {activeAlertsCount} CRITICAL
                  </Badge>
                ) : undefined
              }
            />
          </div>

          {/* Main Grid: Documents Table & Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Documents & Cryptographic Status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Documents Card */}
              <GlassPanel className="p-4 sm:p-5">
                <CardHeader>
                  <div>
                    <CardTitle>Case Evidence & Cryptographic Status</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
                      <button
                        onClick={() => setEvidenceViewMode('folder')}
                        title="Folder View"
                        aria-label="Folder View"
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          evidenceViewMode === 'folder'
                            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEvidenceViewMode('table')}
                        title="Table View"
                        aria-label="Table View"
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          evidenceViewMode === 'table'
                            ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                {evidenceViewMode === 'folder' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-1">
                    {documents.map((doc) => (
                      <EvidenceFolderCard
                        key={doc.id}
                        document={doc}
                        onInspectProof={handleInspectVerification}
                      />
                    ))}
                  </div>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHeader>
                        <TableRow isHoverable={false}>
                          <TableHead>Document / Artifact</TableHead>
                          <TableHead>Case Reference</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Classification</TableHead>
                          <TableHead>Ciphertext SHA-256</TableHead>
                          <TableHead>Integrity</TableHead>
                          <TableHead className="text-right">Verification</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <div className="font-medium text-[var(--text-primary)] leading-tight">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                                {doc.id} · v{doc.version} · {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                              </div>
                            </TableCell>
                            <TableCell isMonospace>{doc.caseNumber}</TableCell>
                            <TableCell>
                              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                                {doc.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                size="sm"
                                variant={
                                  doc.classification === 'TOP_SECRET'
                                    ? 'danger'
                                    : doc.classification === 'SECRET'
                                    ? 'warning'
                                    : 'default'
                                }
                              >
                                {doc.classification}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <HashDisplay hash={doc.sha256Ciphertext} truncateLength={5} />
                            </TableCell>
                            <TableCell>
                              <IntegrityBadge status={doc.integrityStatus} size="sm" />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInspectVerification(doc)}
                              >
                                Inspect Proof
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </GlassPanel>

              {/* Recent Assigned Cases */}
              <GlassPanel className="p-4 sm:p-5">
                <CardHeader>
                  <div>
                    <CardTitle>Recent Investigative Cases</CardTitle>
                    <CardDescription>
                      Assigned cases governed by role-based access control and case membership.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
                    <button
                      onClick={() => setCaseViewMode('folder')}
                      title="Dossier View"
                      aria-label="Dossier View"
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        caseViewMode === 'folder'
                          ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCaseViewMode('table')}
                      title="List View"
                      aria-label="List View"
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        caseViewMode === 'table'
                          ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardHeader>

                {caseViewMode === 'folder' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-1">
                    {FIXTURE_CASES.map((c) => (
                      <CaseFolderCard
                        key={c.id}
                        caseRecord={c}
                        onViewCase={(caseRec) => setSelectedCase(caseRec)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {FIXTURE_CASES.map((c) => (
                      <div
                        key={c.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-[var(--surface-hover)] -mx-4 px-4 sm:-mx-5 sm:px-5 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                              {c.caseNumber}
                            </span>
                            <Badge size="sm" variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>
                              {c.status}
                            </Badge>
                            <Badge size="sm">{c.classification}</Badge>
                          </div>
                          <p className="text-xs text-[var(--text-primary)] mt-1 font-medium truncate">
                            {c.title}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {c.assignedDepartment} · IO: {c.investigatingOfficerName}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--text-muted)]">
                          <span className="font-mono tabular-nums">{c.documentCount} Evidence Items</span>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedCase(c)}>
                            View Case
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassPanel>
            </div>

            {/* Right 1 Col: Security Alerts & Pending Transfers */}
            <div className="space-y-6">
              {/* Security Warnings */}
              <GlassPanel className="p-4 sm:p-5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <CardTitle>Warnings</CardTitle>
                  </div>
                  {alerts.filter((a) => a.status === 'OPEN').length > 0 && (
                    <Badge variant="danger" size="sm">
                      {alerts.filter((a) => a.status === 'OPEN').length} Active
                    </Badge>
                  )}
                </CardHeader>

                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const isTamper = alert.alertType === 'TAMPER_DETECTED';
                    const isAccess = alert.alertType === 'UNAUTHORIZED_ACCESS';
                    const simpleTitle = isTamper
                      ? 'File Modified Without Permission'
                      : isAccess
                      ? 'Unauthorized Access Blocked'
                      : 'System Check Completed';
                    const simpleMessage = isTamper
                      ? `Evidence file ${alert.resourceId} was altered without authorization.`
                      : isAccess
                      ? `Someone tried to access file ${alert.resourceId} without permission.`
                      : 'A routine system verification check was completed.';
                    const isOpen = alert.status === 'OPEN';

                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-1 transition-colors ${
                          isOpen
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-[var(--border)] bg-[var(--surface-elevated)] opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <span className="font-semibold text-[var(--text-primary)] leading-tight block">
                              {simpleTitle}
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                              {simpleMessage}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center justify-end">
                            {isOpen ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 px-2.5"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                              >
                                Dismiss
                              </Button>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] font-medium px-1">
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              {/* Evidence Transfers Card */}
              <GlassPanel className="p-4 sm:p-5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-[var(--text-secondary)]" />
                    <CardTitle>Evidence Transfers</CardTitle>
                  </div>
                  {pendingTransfers > 0 && (
                    <Badge variant="warning" size="sm">
                      {pendingTransfers} Pending
                    </Badge>
                  )}
                </CardHeader>

                <div className="space-y-3">
                  {transfers.map((trf) => {
                    const isPending = trf.status === 'AWAITING_ACCEPTANCE';
                    const simpleTitle = isPending
                      ? 'Custody Acceptance Required'
                      : 'Transfer Completed';
                    const simpleMessage = isPending
                      ? `"${trf.documentName}" is waiting for custody acceptance.`
                      : `"${trf.documentName}" has been successfully transferred.`;

                    return (
                      <div
                        key={trf.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-2 transition-colors ${
                          isPending
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-[var(--border)] bg-[var(--surface-elevated)] opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <span className="font-semibold text-[var(--text-primary)] leading-tight block">
                              {simpleTitle}
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                              {simpleMessage}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center justify-end">
                            {isPending ? (
                              <Button
                                size="sm"
                                variant="primary"
                                className="text-xs h-7 px-3 whitespace-nowrap"
                                onClick={() => handleAcceptTransfer(trf.id)}
                              >
                                Accept Custody
                              </Button>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] font-medium px-1">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>
          </div>
        </>
      )}

      {/* Verification Inspection Modal */}
      {inspectedDoc && (
        <VerificationResultModal
          isOpen={Boolean(inspectedDoc)}
          onClose={() => setInspectedDoc(null)}
          document={inspectedDoc}
          detail={getVerificationDetailForDoc(inspectedDoc)}
        />
      )}

      {/* Register / Ingest Evidence Modal */}
      <IngestEvidenceModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onDocumentCreated={handleDocumentAdded}
      />

      {/* Case Details Modal */}
      <CaseDetailsModal
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        caseRecord={selectedCase}
      />
    </div>
  );
};
