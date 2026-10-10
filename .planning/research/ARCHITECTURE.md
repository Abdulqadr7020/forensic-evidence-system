# Architecture Research

**Domain:** Cryptographic Storage & Backend Architecture for Sentinel DMS  
**Researched:** 2026-10-10  
**Confidence:** HIGH  

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React 19 + Vite)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Ingest Modal │  │  Case Modal  │  │ Documents / View │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                   │             │
├─────────┴─────────────────┴───────────────────┴─────────────┤
│                 Backend API (Node.js + Express)             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │        API Endpoints (/api/crypto, /api/evidence)    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │   Crypto Core (node:crypto - AES-256-GCM Engine)    │    │
│  │    • CSPRNG 12-byte IV generation                   │    │
│  │    • Cipher / Decipher with 16-byte GCM Tag         │    │
│  │    • Plaintext & Ciphertext SHA-256 Hash Digester   │    │
│  └──────────────────────────┬──────────────────────────┘    │
├─────────────────────────────┼───────────────────────────────┤
│                             │                               │
│                   Supabase Cloud Platform                   │
│  ┌──────────────────────────┴─┐  ┌────────────────────────┐ │
│  │ Supabase Storage            │  │ Supabase Postgres DB   │ │
│  │ Bucket: 'evidence-vault'   │  │ Tables: documents,     │ │
│  │ (Encrypted Blobs)          │  │ cases, checkpoints     │ │
│  └────────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `server/crypto.ts` | Pure cryptographic primitives using `node:crypto` | `encryptData(buffer, key)`, `decryptData(payload, key)`, `encryptText(string, key)` |
| `server/index.ts` | Express server handling file upload, encryption, and Supabase interaction | Express router, `multer.memoryStorage()`, calling Supabase admin/client |
| `src/services/evidenceApi.ts` | Frontend client interacting with backend API | `uploadEvidence(file, metadata)`, `downloadDecryptedEvidence(docId)`, `createEncryptedCase(caseData)` |
| `src/components/modals/IngestEvidenceModal.tsx` | UI evidence submission dialog with encryption progress indicators | Real upload dispatching to backend, showing IV and hash verification |
| `src/components/modals/CreateCaseModal.tsx` | Case registration dialog with field-level encryption | Dispatches case creation through encrypted backend endpoint |

## Recommended Project Structure

```
sentinel-dms/
├── server/                      # Node.js backend crypto & API service
│   ├── crypto.ts                # AES-256-GCM node:crypto engine
│   ├── supabaseAdmin.ts         # Supabase client with service credentials
│   ├── routes.ts                # Ingestion, case creation, and download routes
│   └── index.ts                 # Express server bootstrap (port 3001)
├── src/
│   ├── services/
│   │   ├── api.ts               # HTTP client for backend endpoints
│   │   └── db.ts                # Updated database queries supporting encrypted fields
│   ├── components/
│   │   ├── modals/
│   │   │   ├── IngestEvidenceModal.tsx # Updated with real upload & encryption
│   │   │   └── CreateCaseModal.tsx     # Updated with encrypted field persistence
│   │   └── security/
│   │       └── VerificationResultModal.tsx # Live decryption & hash verification
├── .env.local                   # Contains ENCRYPTION_KEY, SUPABASE_SERVICE_ROLE_KEY
└── vite.config.ts               # Configured with proxy to /api (or concurrently running script)
```

## Data Flow

### 1. Evidence Ingestion Flow
1. User selects file and fills case details in `IngestEvidenceModal`.
2. Client sends multipart `FormData` to `/api/evidence/upload`.
3. Server generates SHA-256 hash of plaintext file.
4. Server generates random 12-byte IV: `crypto.randomBytes(12)`.
5. Server encrypts buffer using `crypto.createCipheriv('aes-256-gcm', key, iv)`.
6. Server obtains 16-byte GCM authentication tag: `cipher.getAuthTag()`.
7. Server packages payload: `[IV (12B)][Auth Tag (16B)][Ciphertext]` or structured metadata.
8. Server computes SHA-256 hash of ciphertext.
9. Server uploads encrypted blob to Supabase Storage bucket `evidence-vault`.
10. Server creates record in Supabase `documents` table storing file metadata, ciphertext hash, plaintext hash, and storage path.
11. Server returns verified document record to frontend; UI shows green verification checkmark and commits Merkle checkpoint.

### 2. Evidence Retrieval & Decryption Flow
1. User clicks download/inspect in Documents view.
2. Client requests `/api/evidence/:id/download`.
3. Server fetches encrypted blob from Supabase Storage.
4. Server extracts IV, Auth Tag, and Ciphertext.
5. Server creates decipher: `crypto.createDecipheriv('aes-256-gcm', key, iv)` and sets auth tag.
6. Server decrypts payload; if tag fails, throws authentication error (`400 Invalid Auth Tag - Tampering Detected`).
7. Server streams decrypted original file to client with headers matching original MIME type.
