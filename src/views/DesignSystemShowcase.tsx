import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Switch } from '../components/ui/Switch';
import { FileUpload } from '../components/ui/FileUpload';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Tabs } from '../components/ui/Tabs';
import { Dropdown } from '../components/ui/Dropdown';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Alert } from '../components/ui/Alert';
import { Skeleton, TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { IntegrityBadge } from '../components/security/IntegrityBadge';
import { HashDisplay } from '../components/security/HashDisplay';
import { useToast } from '../context/ToastContext';
import {
  Check,
  Search,
  Key,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  FileText,
  Upload,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const { success, warning, error, info } = useToast();

  // State for interactive showcase controls
  const [inputText, setInputText] = useState('CR-2026-0104-EVID');
  const [inputError, setInputError] = useState('');
  const [textareaText, setTextareaText] = useState('Case notes: Cryptographic seal verified upon receipt.');
  const [selectVal, setSelectVal] = useState('option-1');
  const [checkedBox, setCheckedBox] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [activeTab, setActiveTab] = useState('tab-1');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Design System"
        description="Reusable UI component library following Vercel's minimalist black-and-white visual design."
      />

      {/* Buttons & Actions */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Buttons & Controls
        </h2>
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Action</Button>
                <Button variant="primary" isLoading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Sizes & Icons</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="primary" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Small Button
                </Button>
                <Button size="md" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Medium Button
                </Button>
                <Button size="lg" variant="outline" leftIcon={<Key className="w-4 h-4" />}>
                  Large Button
                </Button>
                <IconButton icon={<Search className="w-4 h-4" />} aria-label="Search records" />
                <IconButton icon={<MoreVertical className="w-4 h-4" />} aria-label="More options" variant="ghost" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Form Inputs & Selection */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Form Inputs & Controls
        </h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input
              label="Standard Text Input"
              placeholder="Case Identifier..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              helperText="Unique identifier alphanumeric string."
            />

            <Input
              label="Input with Error State"
              placeholder="e.g. SHA-256 Hash"
              value="invalid_hash_string"
              error="Hexadecimal length must be exactly 64 characters."
            />

            <Input
              label="Monospace Input with Left Icon"
              leftIcon={<Key className="w-3.5 h-3.5" />}
              isMonospace
              defaultValue="7f83b1657ff1fc53b92dc18148a1d65d"
              helperText="Target cryptographic digest."
            />

            <Select
              label="Selection Dropdown"
              options={[
                { value: 'option-1', label: 'First Information Report (FIR)' },
                { value: 'option-2', label: 'Charge Sheet (Section 66C/66D)' },
                { value: 'option-3', label: 'Volatile RAM Forensic Binary' },
              ]}
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              helperText="Evidence classification category."
            />

            <div className="flex flex-col gap-3 justify-center">
              <Checkbox
                label="Require Multi-Party Attestation"
                description="Requires two authorized signatories before custody transfer."
                checked={checkedBox}
                onChange={(e) => setCheckedBox(e.target.checked)}
              />

              <Switch
                label="Automated Bit-Level Detection"
                description="Continuously recalculate SHA-256 hashes against Merkle root."
                checked={switchVal}
                onChange={setSwitchVal}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Textarea
                label="Case Examination Notes"
                placeholder="Enter formal justification or chain of custody annotation..."
                value={textareaText}
                onChange={(e) => setTextareaText(e.target.value)}
                helperText="Permanent append-only record."
              />
            </div>
          </div>
        </Card>
      </section>

      {/* File Dropzone */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Evidence Ingestion & Dropzone
        </h2>
        <Card>
          <FileUpload />
        </Card>
      </section>

      {/* Badges & Integrity */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Badges & Cryptographic Statuses
        </h2>
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Semantic Badges</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">DEFAULT BADGE</Badge>
                <Badge variant="success">APPROVED / VERIFIED</Badge>
                <Badge variant="warning">AWAITING CUSTODY</Badge>
                <Badge variant="danger">SECURITY CRITICAL</Badge>
                <Badge variant="info">CLASSIFIED RESTRICTED</Badge>
                <Badge variant="neutral">INACTIVE</Badge>
                <Badge isMonospace>MERKLE_SEQ_#104</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Zero-Trust Integrity Statuses</p>
              <div className="flex flex-wrap items-center gap-2">
                <IntegrityBadge status="VERIFIED" />
                <IntegrityBadge status="VERIFICATION_PENDING" />
                <IntegrityBadge status="TAMPERING_DETECTED" />
                <IntegrityBadge status="PROOF_INVALID" />
                <IntegrityBadge status="LEDGER_INCONSISTENT" />
                <IntegrityBadge status="NOT_AUTHORIZED" />
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Cryptographic Hash Displays</p>
              <div className="flex flex-wrap items-center gap-3">
                <HashDisplay hash="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" label="SHA-256" />
                <HashDisplay hash="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" label="Ciphertext" />
                <HashDisplay hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8" label="Root" truncateLength={12} />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Metrics & Tables */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Metrics & Tables
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Verified Records"
            value="14,892"
            supportingText="100% Invariant pass rate"
            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            trendText="+340 today"
            trendDirection="up"
          />
          <MetricCard
            label="Pending Transits"
            value="3"
            supportingText="Laboratory queue"
            icon={<FileText className="w-4 h-4" />}
            alertBadge={<Badge variant="warning" size="sm">REVIEW</Badge>}
          />
          <MetricCard
            label="Tamper Detection Alarms"
            value="1"
            supportingText="Storage byte divergence"
            icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
            alertBadge={<Badge variant="danger" size="sm">CRITICAL</Badge>}
          />
        </div>

        <Card>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHead>Sample Column A</TableHead>
                  <TableHead>Identifier</TableHead>
                  <TableHead>Timestamp (UTC)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>First Information Report #01</TableCell>
                  <TableCell isMonospace>DOC-FIR-2026-9901</TableCell>
                  <TableCell isMonospace>2026-10-09 01:30:00</TableCell>
                  <TableCell><Badge variant="success" size="sm">VERIFIED</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Inspect</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Volatile Memory Extract</TableCell>
                  <TableCell isMonospace>DOC-EVD-2026-8802</TableCell>
                  <TableCell isMonospace>2026-10-08 16:20:00</TableCell>
                  <TableCell><Badge variant="danger" size="sm">TAMPERED</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive">Investigate</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            totalItems={48}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
        </Card>
      </section>

      {/* Tabs, Dialogs & Feedback */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--text-primary)] uppercase border-b border-[var(--border)] pb-2">
          Tabs, Dialogs & Feedback
        </h2>
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Border-based Tabs</p>
              <Tabs
                tabs={[
                  { id: 'tab-1', label: 'Evidence Overview', badge: 14 },
                  { id: 'tab-2', label: 'Cryptographic Invariants', badge: 5 },
                  { id: 'tab-3', label: 'Chain of Custody' },
                  { id: 'tab-4', label: 'Append-Only Audit Log' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>
                Open Standard Dialog
              </Button>
              <Button variant="destructive" onClick={() => setIsConfirmDialogOpen(true)}>
                Open High-Risk Confirmation Dialog
              </Button>
              <Dropdown
                align="left"
                trigger={<Button variant="outline">Open Context Menu</Button>}
                items={[
                  { id: 'a1', label: 'Export SHA-256 Digest', onClick: () => info('Digest exported') },
                  { id: 'a2', label: 'Verify Merkle Inclusion', onClick: () => success('Merkle Proof Validated') },
                  { id: 'a3', label: 'Revoke Judicial Grant', isDestructive: true, onClick: () => warning('Grant revoked') },
                ]}
              />
            </div>

            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Toast Feedback Triggers</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => success('Cryptographic Proof Verified', 'Ed25519 root signature verified by HSM.')}>
                  Trigger Success Toast
                </Button>
                <Button size="sm" variant="outline" onClick={() => warning('Custody Transfer Pending', 'Awaiting laboratory specialist acceptance.')}>
                  Trigger Warning Toast
                </Button>
                <Button size="sm" variant="outline" onClick={() => error('Tampering Detected', 'Ciphertext hash mismatch on DOC-8802.')}>
                  Trigger Danger Toast
                </Button>
                <Button size="sm" variant="outline" onClick={() => info('Session Revalidated', 'ABAC zero-trust policy token renewed.')}>
                  Trigger Info Toast
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Alert variant="info" title="Zero-Trust Enclave Notice">
                Every API call revalidates cryptographic signatures and checks ABAC case assignment in hardware.
              </Alert>
              <Alert variant="danger" title="Storage Invariant Violation">
                Byte block #4 diverges from registered SHA-256 digest committed at sequence #104.
              </Alert>
            </div>
          </div>
        </Card>
      </section>

      {/* Dialog Modals */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Standard Modality Dialog"
        description="Centered modal with escape key handler, focus trapping, and clean monochrome borders."
        footer={
          <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        }
      >
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          This dialog adheres strictly to Section 15 of design.md. It avoids unnecessary shadows, uses clean 1px borders, and maintains high readability in both dark and light modes.
        </p>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => {
          setIsConfirmDialogOpen(false);
          warning('Action executed', 'Access privilege revoked.');
        }}
        title="Revoke Judicial Access Grant"
        description="Are you sure you want to revoke Public Prosecutor access to Case CR-2026-0104? This action creates an immutable audit event."
        confirmLabel="Revoke Grant"
        isDestructive
      />
    </div>
  );
};
