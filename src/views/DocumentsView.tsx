import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/Table';
import { IntegrityBadge } from '../components/security/IntegrityBadge';
import { HashDisplay } from '../components/security/HashDisplay';
import { VerificationResultModal } from '../components/security/VerificationResultModal';
import { IngestEvidenceModal } from '../components/modals/IngestEvidenceModal';
import { EvidenceFolderCard } from '../components/ui/EvidenceFolderCard';
import { FIXTURE_DOCUMENTS, getVerificationDetailForDoc } from '../data/fixtures';
import { DocumentRecord } from '../types/models';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(FIXTURE_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'folder' | 'table'>('folder');

  const filteredDocs = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Encrypted evidence repository with cryptographic verification and Merkle ledger commitments."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsIngestOpen(true)}
          >
            Ingest Document
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by file name, document ID, or case number..."
          leftIcon={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Encrypted Document Registry</CardTitle>
            <CardDescription>
              Showing {filteredDocs.length} encrypted records with cryptographic verification status.
            </CardDescription>
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
            <button
              onClick={() => setViewMode('folder')}
              title="Folder View"
              aria-label="Folder View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'folder'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Table View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>

        {viewMode === 'folder' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 p-1">
            {filteredDocs.map((doc) => (
              <EvidenceFolderCard
                key={doc.id}
                document={doc}
                onInspectProof={(d) => setSelectedDoc(d)}
              />
            ))}
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHead>Document / Evidence Name</TableHead>
                  <TableHead>Case Reference</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Stored Ciphertext Hash</TableHead>
                  <TableHead>Integrity State</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium text-[var(--text-primary)] leading-tight">{doc.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                        {doc.id} · v{doc.version} · {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </TableCell>
                    <TableCell isMonospace>{doc.caseNumber}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
                      <Badge size="sm" variant={doc.classification === 'TOP_SECRET' ? 'danger' : 'warning'}>
                        {doc.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <HashDisplay hash={doc.sha256Ciphertext} truncateLength={6} />
                    </TableCell>
                    <TableCell>
                      <IntegrityBadge status={doc.integrityStatus} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDoc(doc)}
                      >
                        Verify Invariant
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {selectedDoc && (
        <VerificationResultModal
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          detail={getVerificationDetailForDoc(selectedDoc)}
        />
      )}

      <IngestEvidenceModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onDocumentCreated={(newDoc) => setDocuments((prev) => [newDoc, ...prev])}
      />
    </div>
  );
};
