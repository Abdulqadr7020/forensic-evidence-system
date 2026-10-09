import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CaseRecord, DocumentClassification } from '../../types/models';

export interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (newCase: CaseRecord) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onCaseCreated,
}) => {
  const { user } = useAuth();
  const { success } = useToast();

  const [caseNumber, setCaseNumber] = useState(
    () => `CR-2026-0${Math.floor(400 + Math.random() * 500)}`
  );
  const [title, setTitle] = useState('');
  const [crimeCategory, setCrimeCategory] = useState('Cyber Financial Fraud');
  const [classification, setClassification] = useState<DocumentClassification>('CONFIDENTIAL');
  const [assignedDepartment, setAssignedDepartment] = useState(
    user.department || 'Central Crime Branch (Division 4)'
  );
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Case title is required.');
      return;
    }

    const newCase: CaseRecord = {
      id: `case_${Date.now()}`,
      caseNumber: caseNumber.trim() || `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      crimeCategory,
      status: 'ACTIVE',
      assignedDepartment,
      investigatingOfficerId: user.id,
      investigatingOfficerName: user.name,
      documentCount: 0,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      classification,
    };

    onCaseCreated(newCase);
    success('Case Dossier Registered', `${newCase.caseNumber} registered in secure database.`);
    
    // Reset form
    setTitle('');
    setDescription('');
    setError('');
    setCaseNumber(`CR-2026-0${Math.floor(400 + Math.random() * 500)}`);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Investigative Case"
      description="Register a new legal case dossier with department assignment and zero-trust classification."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} type="submit">
            Register Case Dossier
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Case Number"
            isMonospace
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            helperText="Canonical judicial identifier"
          />

          <Select
            label="Crime Category"
            value={crimeCategory}
            onChange={(e) => setCrimeCategory(e.target.value)}
            options={[
              { value: 'Cyber Financial Fraud', label: 'Cyber Financial Fraud' },
              { value: 'Critical Infrastructure Assault', label: 'Critical Infrastructure Assault' },
              { value: 'Evidence Tampering Inquiry', label: 'Evidence Tampering Inquiry' },
              { value: 'Public Corruption & Bribery', label: 'Public Corruption & Bribery' },
              { value: 'Organized Cybercrime Syndicate', label: 'Organized Cybercrime Syndicate' },
              { value: 'Digital Extortion / Ransomware', label: 'Digital Extortion / Ransomware' },
            ]}
          />
        </div>

        <Input
          label="Case Title"
          placeholder="e.g. State vs. Apex Financial Syndicate"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Security Classification"
            value={classification}
            onChange={(e) => setClassification(e.target.value as DocumentClassification)}
            options={[
              { value: 'RESTRICTED', label: 'RESTRICTED' },
              { value: 'CONFIDENTIAL', label: 'CONFIDENTIAL' },
              { value: 'SECRET', label: 'SECRET' },
              { value: 'TOP_SECRET', label: 'TOP SECRET' },
            ]}
          />

          <Input
            label="Assigned Department"
            value={assignedDepartment}
            onChange={(e) => setAssignedDepartment(e.target.value)}
          />
        </div>

        <Textarea
          label="Initial Case Summary & Directives"
          placeholder="Brief operational summary, initial complaint details, or FIR reference..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </form>
    </Dialog>
  );
};
