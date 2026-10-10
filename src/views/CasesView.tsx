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
import { fetchCases } from '../services/db';
import { CaseRecord } from '../types/models';
import { CreateCaseModal } from '../components/modals/CreateCaseModal';
import { CaseFolderCard } from '../components/ui/CaseFolderCard';
import { CaseDetailsModal } from '../components/modals/CaseDetailsModal';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';

export const CasesView: React.FC = () => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [viewMode, setViewMode] = useState<'folder' | 'table'>('folder');

  React.useEffect(() => {
    fetchCases()
      .then((data) => setCases(data))
      .finally(() => setLoading(false));
  }, []);

  const handleCaseCreated = (newCase: CaseRecord) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedDepartment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Authorized case dossiers subject to department assignment and access policies."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Case
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Filter cases by case number, crime category, or department..."
          leftIcon={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Accessible Case Dossiers</CardTitle>
            <CardDescription>
              Displaying {filteredCases.length} case files authorized for your active personnel identity.
            </CardDescription>
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
            <button
              onClick={() => setViewMode('folder')}
              title="Dossier View"
              aria-label="Dossier View"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 p-1">
            {filteredCases.map((c) => (
              <CaseFolderCard
                key={c.id}
                caseRecord={c}
                onViewCase={(caseRec) => setSelectedCase(caseRec)}
              />
            ))}
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Case Title / Crime Category</TableHead>
                  <TableHead>Assigned Department</TableHead>
                  <TableHead>Investigating Officer</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Evidence Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell isMonospace className="font-semibold">
                      {c.caseNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[var(--text-primary)] leading-tight">{c.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{c.crimeCategory}</div>
                    </TableCell>
                    <TableCell>{c.assignedDepartment}</TableCell>
                    <TableCell>{c.investigatingOfficerName}</TableCell>
                    <TableCell>
                      <Badge size="sm" variant={c.classification === 'TOP_SECRET' ? 'danger' : 'warning'}>
                        {c.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm" variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell isMonospace className="text-right">
                      {c.documentCount} items
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <CaseDetailsModal
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        caseRecord={selectedCase}
      />

      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
};
