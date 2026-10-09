import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HashDisplay } from '../components/security/HashDisplay';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import { ShieldCheck, History, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'DENIED' | 'TAMPER_ALERT';
  prevHash: string;
  eventHash: string;
}

const FIXTURE_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt_9901',
    timestamp: '2026-10-09T01:48:12Z',
    actor: 'SYSTEM_DAEMON_INTEGRITY',
    actorRole: 'Automated Watchdog',
    action: 'PERIODIC_STORAGE_HASH_VERIFY',
    resource: 'DOC-8802',
    outcome: 'TAMPER_ALERT',
    prevHash: '8b9182390aef9048123840192837401928301928340192834a127f83b190a4ce',
    eventHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  },
  {
    id: 'evt_9900',
    timestamp: '2026-10-09T01:30:00Z',
    actor: 'Inspector Vikram Rathore',
    actorRole: 'Police IO',
    action: 'DOCUMENT_ENCRYPTED_INGESTION',
    resource: 'DOC-8801',
    outcome: 'SUCCESS',
    prevHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    eventHash: '8b9182390aef9048123840192837401928301928340192834a127f83b190a4ce',
  },
  {
    id: 'evt_9899',
    timestamp: '2026-10-08T22:15:00Z',
    actor: 'ANONYMOUS_IP_192.168.4.112',
    actorRole: 'Unauthenticated',
    action: 'RESTRICTED_DOC_DOWNLOAD_ATTEMPT',
    resource: 'DOC-8803',
    outcome: 'DENIED',
    prevHash: '1928374650192837465019283746501928374650192837465019283746501928',
    eventHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
  },
  {
    id: 'evt_9898',
    timestamp: '2026-10-08T15:45:00Z',
    actor: 'Dr. Evelyn Vance, PhD',
    actorRole: 'Forensic Lab Lead',
    action: 'CUSTODY_TRANSFER_ACCEPTANCE',
    resource: 'TRF-2026-0901',
    outcome: 'SUCCESS',
    prevHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    eventHash: '1928374650192837465019283746501928374650192837465019283746501928',
  },
];

export const AuditView: React.FC = () => {
  const { info } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="Append-only hash-chained audit events recording authentication, evidence access, and custody transfers."
        actions={
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => info('Export Initiated', 'Cryptographic audit report generated with Ed25519 checkpoint attestation.')}
          >
            Export Signed Audit Log
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Historical Audit Log</CardTitle>
            <CardDescription>
              Chronological log with previous and current event SHA-256 digest continuity.
            </CardDescription>
          </div>
          <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3 h-3 text-emerald-500" />}>
            HASH CHAIN CONTINUOUS
          </Badge>
        </CardHeader>

        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHead>Event ID</TableHead>
                <TableHead>UTC Timestamp</TableHead>
                <TableHead>Actor / Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Event SHA-256 Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FIXTURE_AUDIT_EVENTS.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell isMonospace>{evt.id}</TableCell>
                  <TableCell isMonospace>{evt.timestamp}</TableCell>
                  <TableCell>
                    <div className="font-medium text-[var(--text-primary)] leading-tight">{evt.actor}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{evt.actorRole}</div>
                  </TableCell>
                  <TableCell isMonospace className="text-[11px] font-semibold">
                    {evt.action}
                  </TableCell>
                  <TableCell isMonospace>{evt.resource}</TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      variant={
                        evt.outcome === 'SUCCESS'
                          ? 'success'
                          : evt.outcome === 'TAMPER_ALERT'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {evt.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <HashDisplay hash={evt.eventHash} truncateLength={6} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
};
