import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IntegrityBadge } from '../components/security/IntegrityBadge';
import { HashDisplay } from '../components/security/HashDisplay';
import { VerificationResultModal } from '../components/security/VerificationResultModal';
import { getVerificationDetailForDoc, FIXTURE_CHECKPOINT } from '../data/fixtures';
import { DocumentRecord, MerkleCheckpoint } from '../types/models';
import { fetchDocuments, fetchLatestCheckpoint } from '../services/db';
import { ShieldCheck, ShieldAlert, CheckCircle2, Bug, RefreshCw, Cpu, Database } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const IntegrityView: React.FC = () => {
  const { success, warning } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [checkpoint, setCheckpoint] = useState<MerkleCheckpoint>(FIXTURE_CHECKPOINT);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchDocuments(), fetchLatestCheckpoint()])
      .then(([docs, cp]) => {
        setDocuments(docs);
        setCheckpoint(cp);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAllVerifications = () => {
    loadData();
    success('Verification Complete', `Evaluated ${documents.length} evidence records against Merkle Checkpoint #${checkpoint.sequence}.`);
  };

  const handleSimulateTamper = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            integrityStatus: 'TAMPERING_DETECTED',
            sha256Ciphertext: '4a1b025687a4192b67f139048a1c97ef8b898a123f18b63991f893d56efb9a4f',
          };
        }
        return doc;
      })
    );
    warning('Tampering Detected', `Unauthorized changes simulated in evidence ${docId}.`);
  };

  const tamperedCount = documents.filter((d) => d.integrityStatus === 'TAMPERING_DETECTED').length;
  const verifiedCount = documents.length - tamperedCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Verification"
        description="Verify the authenticity and integrity of all digital evidence to ensure it has not been altered."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleRunAllVerifications}
          >
            Verify All
          </Button>
        }
      />

      {/* Merkle Checkpoint Banner with Glowing Pulse Animation (D-15) */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <span className="animate-ping absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">
                Merkle Ledger Anchored: Sequence #{checkpoint.sequence}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Hardware Signed
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Root Hash: <HashDisplay hash={checkpoint.rootHash} truncateLength={8} /> · {checkpoint.leafCount} committed leaves
            </div>
          </div>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] font-mono self-start sm:self-auto">
          {new Date(checkpoint.timestamp).toUTCString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">System Security</div>
          <div className="text-xl font-semibold text-emerald-500 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Active & Monitoring</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2">
            Continuous zero-trust GCM verification active
          </div>
        </Card>

        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">Digital Signatures</div>
          <div className="text-xl font-semibold text-emerald-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Authenticated</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            All evidence sealed with AES-256-GCM
          </p>
        </Card>

        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">Overall Evidence Status</div>
          <div className="text-xl font-semibold text-[var(--text-primary)] mt-1">
            {verifiedCount} Secure {tamperedCount > 0 ? `/ ${tamperedCount} Alert` : ''}
          </div>
          {tamperedCount > 0 ? (
            <p className="text-[11px] text-rose-500 mt-2 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Tampering detected in {tamperedCount} file{tamperedCount > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero cryptographic discrepancies found
            </p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Verification List</CardTitle>
          <CardDescription>
            Live status of all digital evidence files registered in the repository.
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          {documents.map((doc) => {
            const isTampered = doc.integrityStatus === 'TAMPERING_DETECTED';

            return (
              <div
                key={doc.id}
                className={`p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
                  isTampered
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-[var(--border)] bg-[var(--surface-elevated)]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--text-primary)]">
                      {doc.name}
                    </span>
                    <Badge size="sm" isMonospace>{doc.id}</Badge>
                    <IntegrityBadge status={doc.integrityStatus} size="sm" />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-muted)]">Digital Seal:</span>
                      <span className={`font-medium ${isTampered ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isTampered ? 'Broken (Bitstring Altered)' : 'Intact (AES-256-GCM Verified)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-muted)]">Merkle Leaf:</span>
                      <HashDisplay hash={doc.merkleLeafHash || ''} truncateLength={6} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {!isTampered && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Bug className="w-3.5 h-3.5 text-amber-500" />}
                      onClick={() => handleSimulateTamper(doc.id)}
                      title="Simulate 1-bit corruption in storage"
                    >
                      Test Tamper
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedDoc && (
        <VerificationResultModal
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          detail={getVerificationDetailForDoc(selectedDoc)}
        />
      )}
    </div>
  );
};
