import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  CaseRecord,
  DocumentRecord,
  EvidenceTransferRecord,
  SecurityAlertRecord,
  MerkleCheckpoint,
} from '../types/models';
import {
  FIXTURE_CASES,
  FIXTURE_DOCUMENTS,
  FIXTURE_TRANSFERS,
  FIXTURE_ALERTS,
  FIXTURE_CHECKPOINT,
} from '../data/fixtures';

export const mapDbCase = (row: any): CaseRecord => ({
  id: row.id,
  caseNumber: row.case_number,
  title: row.title,
  crimeCategory: row.crime_category,
  status: row.status,
  assignedDepartment: row.assigned_department,
  investigatingOfficerId: row.investigating_officer_id || '',
  investigatingOfficerName: row.investigating_officer_name,
  documentCount: row.document_count || 0,
  lastActivityAt: row.last_activity_at || row.created_at,
  createdAt: row.created_at,
  classification: row.classification,
});

export const mapDbDocument = (row: any): DocumentRecord => ({
  id: row.id,
  caseId: row.case_id,
  caseNumber: row.case_number,
  name: row.name,
  category: row.category,
  version: row.version,
  classification: row.classification,
  fileSizeBytes: Number(row.file_size_bytes) || 0,
  mimeType: row.mime_type,
  uploadedBy: row.uploaded_by,
  uploadedAt: row.uploaded_at,
  integrityStatus: row.integrity_status,
  status: row.status,
  currentCustodian: row.current_custodian,
  sha256Plaintext: row.sha256_plaintext,
  sha256Ciphertext: row.sha256_ciphertext,
  merkleLeafHash: row.merkle_leaf_hash,
  checkpointSequence: row.checkpoint_sequence,
});

export const mapDbTransfer = (row: any): EvidenceTransferRecord => ({
  id: row.id,
  transferId: row.transfer_id,
  documentId: row.document_id,
  documentName: row.document_name,
  caseNumber: row.case_number,
  originDepartment: row.origin_department,
  originOfficer: row.origin_officer,
  destinationDepartment: row.destination_department,
  destinationOfficer: row.destination_officer,
  requestedAt: row.requested_at,
  status: row.status,
  reason: row.reason,
  chainValidationHash: row.chain_validation_hash,
});

export const mapDbAlert = (row: any): SecurityAlertRecord => ({
  id: row.id,
  alertType: row.alert_type,
  severity: row.severity,
  title: row.title,
  description: row.description,
  resourceId: row.resource_id,
  resourceType: row.resource_type,
  timestamp: row.timestamp,
  status: row.status,
  observedHash: row.observed_hash,
  expectedHash: row.expected_hash,
});

export const mapDbCheckpoint = (row: any): MerkleCheckpoint => ({
  sequence: row.sequence,
  rootHash: row.root_hash,
  leafCount: row.leaf_count,
  timestamp: row.timestamp,
  signingKeyId: row.public_key_fingerprint,
  signatureVerified: row.hardware_signed,
});

export const fetchCases = async (): Promise<CaseRecord[]> => {
  if (!isSupabaseConfigured) return FIXTURE_CASES;
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return FIXTURE_CASES;
    return data.map(mapDbCase);
  } catch {
    return FIXTURE_CASES;
  }
};

export const fetchDocuments = async (): Promise<DocumentRecord[]> => {
  try {
    const res = await fetch('http://localhost:3001/api/evidence');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as DocumentRecord[];
      }
    }
  } catch (err) {
    console.warn('Backend /api/evidence unavailable, falling back to database/fixtures:', err);
  }

  if (!isSupabaseConfigured) return FIXTURE_DOCUMENTS;
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error || !data || data.length === 0) return FIXTURE_DOCUMENTS;
    return data.map(mapDbDocument);
  } catch {
    return FIXTURE_DOCUMENTS;
  }
};

export const fetchTransfers = async (): Promise<EvidenceTransferRecord[]> => {
  if (!isSupabaseConfigured) return FIXTURE_TRANSFERS;
  try {
    const { data, error } = await supabase
      .from('evidence_transfers')
      .select('*')
      .order('requested_at', { ascending: false });
    if (error || !data || data.length === 0) return FIXTURE_TRANSFERS;
    return data.map(mapDbTransfer);
  } catch {
    return FIXTURE_TRANSFERS;
  }
};

export const fetchAlerts = async (): Promise<SecurityAlertRecord[]> => {
  if (!isSupabaseConfigured) return FIXTURE_ALERTS;
  try {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error || !data || data.length === 0) return FIXTURE_ALERTS;
    return data.map(mapDbAlert);
  } catch {
    return FIXTURE_ALERTS;
  }
};

export const fetchLatestCheckpoint = async (): Promise<MerkleCheckpoint> => {
  if (!isSupabaseConfigured) return FIXTURE_CHECKPOINT;
  try {
    const { data, error } = await supabase
      .from('merkle_checkpoints')
      .select('*')
      .order('sequence', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return FIXTURE_CHECKPOINT;
    return mapDbCheckpoint(data);
  } catch {
    return FIXTURE_CHECKPOINT;
  }
};
