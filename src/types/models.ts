export type IntegrityStatus = 
  | 'VERIFIED'
  | 'VERIFICATION_PENDING'
  | 'TAMPERING_DETECTED'
  | 'PROOF_INVALID'
  | 'LEDGER_INCONSISTENT'
  | 'VERIFICATION_FAILED'
  | 'NOT_AUTHORIZED';

export type DocumentClassification = 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET' | 'TOP_SECRET';

export type DocumentStatus = 
  | 'DRAFT'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'ARCHIVED'
  | 'FAILED';

export type EvidenceTransferStatus = 
  | 'REQUESTED'
  | 'AWAITING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED';

export type SecurityAlertSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'RESOLVED';

export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  crimeCategory: string;
  status: 'ACTIVE' | 'UNDER_INVESTIGATION' | 'TRIAL_PENDING' | 'CLOSED';
  assignedDepartment: string;
  investigatingOfficerId: string;
  investigatingOfficerName: string;
  documentCount: number;
  lastActivityAt: string;
  createdAt: string;
  classification: DocumentClassification;
}

export interface DocumentRecord {
  id: string;
  caseId: string;
  caseNumber: string;
  name: string;
  category: 'FIR' | 'WITNESS_STATEMENT' | 'FORENSIC_REPORT' | 'CHARGE_SHEET' | 'DIGITAL_EVIDENCE' | 'COURT_ORDER';
  version: string;
  classification: DocumentClassification;
  fileSizeBytes: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  integrityStatus: IntegrityStatus;
  status: DocumentStatus;
  currentCustodian: string;
  sha256Plaintext: string;
  sha256Ciphertext: string;
  merkleLeafHash: string;
  checkpointSequence: number;
  iv?: string;
  authTag?: string;
}

export interface EvidenceTransferRecord {
  id: string;
  transferId: string;
  documentId: string;
  documentName: string;
  caseNumber: string;
  originDepartment: string;
  originOfficer: string;
  destinationDepartment: string;
  destinationOfficer?: string;
  requestedAt: string;
  status: EvidenceTransferStatus;
  reason: string;
  chainValidationHash: string;
}

export interface SecurityAlertRecord {
  id: string;
  alertType: 'TAMPER_DETECTED' | 'UNAUTHORIZED_ACCESS' | 'PROOF_MISMATCH' | 'SESSION_ANOMALY';
  severity: SecurityAlertSeverity;
  title: string;
  description: string;
  resourceId: string;
  resourceType: 'DOCUMENT' | 'CASE' | 'MERKLE_TREE' | 'USER_ACCOUNT';
  timestamp: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ACKNOWLEDGED' | 'RESOLVED';
  observedHash?: string;
  expectedHash?: string;
}

export interface MerkleCheckpoint {
  sequence: number;
  rootHash: string;
  leafCount: number;
  timestamp: string;
  signingKeyId: string;
  signatureVerified: boolean;
}

export interface VerificationChecklistDetail {
  ciphertextHashMatch: boolean;
  plaintextHashMatch: boolean;
  merkleProofValid: boolean;
  checkpointSignatureValid: boolean;
  auditChainConsistent: boolean;
  expectedCiphertextHash: string;
  observedCiphertextHash: string;
  merkleRoot: string;
  checkpointSequence: number;
  verificationTimestamp: string;
  overallStatus: IntegrityStatus;
  notes?: string;
}
