import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { IntegrityBadge } from '../components/security/IntegrityBadge';
import { Alert } from '../components/ui/Alert';
import { VerificationResultModal } from '../components/security/VerificationResultModal';
import { FIXTURE_DOCUMENTS, FIXTURE_CHECKPOINT, getVerificationDetailForDoc } from '../data/fixtures';
import { DocumentRecord } from '../types/models';
import { ShieldCheck, ShieldAlert, CheckCircle2, Bug, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const IntegrityView: React.FC = () => {
  const { success, warning } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>(FIXTURE_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  const handleRunAllVerifications = () => {
    success('Verification Complete', 'Evaluated 5 evidence files for authenticity.');
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
    warning('Tampering Detected', `Unauthorized changes detected in evidence ${docId}.`);
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">System Security</div>
          <div className="text-xl font-semibold text-emerald-500 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Active & Monitoring</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2">
            Continuous background verification enabled
          </div>
        </Card>

        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">Digital Signatures</div>
          <div className="text-xl font-semibold text-emerald-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Authenticated</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            All evidence is cryptographically sealed
          </p>
        </Card>

        <Card>
          <div className="text-xs text-[var(--text-muted)] font-medium">Overall Evidence Status</div>
          <div className="text-xl font-semibold text-[var(--text-primary)] mt-1">
            4 Secure / 1 Alert
          </div>
          <p className="text-[11px] text-rose-500 mt-2 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Tampering detected in 1 file
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence Verification List</CardTitle>
          <CardDescription>
            Live status of all digital evidence files.
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
                        {isTampered ? 'Broken (File Altered)' : 'Intact (Authentic)'}
                      </span>
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
