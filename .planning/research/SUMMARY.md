# Project Research Summary

**Project:** Sentinel DMS  
**Domain:** Cryptographic Evidence Storage & Node.js Backend Security Service  
**Researched:** 2026-10-10  
**Confidence:** HIGH  

## Executive Summary

Sentinel DMS requires enterprise-grade cryptographic guarantees for digital evidence and case records. Rather than relying on unauthenticated client-side encryption or exposing master encryption secrets to the web browser, the system implements a dedicated Node.js backend cryptographic service using Node.js's inbuilt `node:crypto` module. This service performs AES-256-GCM authenticated encryption on evidence file payloads and sensitive database records before persisting them to Supabase Storage and Supabase Postgres tables.

The recommended architectural approach leverages an Express API server with Vite integration to handle multipart evidence uploads, compute SHA-256 integrity digests (both plaintext and ciphertext), generate cryptographically secure 12-byte random initialization vectors (IVs) for every item, and seal each payload with a 16-byte GCM authentication tag. The encrypted artifacts are stored in a dedicated `evidence-vault` Supabase Storage bucket, while cryptographic metadata (hashes, IVs, Merkle checkpoints) are recorded in Supabase database tables.

Key risks—specifically IV reuse, client-side secret leakage, memory exhaustion during large file uploads, and unauthenticated cipher tampering—are mitigated by strict server-side key management, CSPRNG IV generation per operation, stream/buffer size limits, and mandatory GCM auth tag verification during retrieval and download workflows.

## Key Findings

### Recommended Stack

The stack relies on standard, production-tested technologies with minimal external overhead:
- **`node:crypto`**: Zero-dependency inbuilt Node.js module providing hardware-accelerated AES-256-GCM, SHA-256 hashing, and cryptographically secure random bytes.
- **`express` & `multer`**: Lightweight server layer handling binary evidence uploads, multipart parsing, and REST endpoints for encryption/decryption.
- **`@supabase/supabase-js`**: Unified interface for persisting encrypted blobs to Supabase Storage and storing relational metadata in Postgres.
- **`tsx` & `cors`**: Frictionless TypeScript execution for backend development and secure CORS integration with the React SPA frontend.

### Expected Features

**Must have (table stakes):**
- **AES-256-GCM Binary Encryption**: Encrypting uploaded evidence files using `node:crypto` with unique 12-byte IVs and 16-byte authentication tags.
- **Supabase Storage Persistence**: Uploading encrypted binary files to the `evidence-vault` storage bucket with signed URL retrieval.
- **Field-Level Record Encryption**: Encrypting sensitive case notes, witness statements, and transfer justifications before inserting into Supabase tables.
- **Cryptographic Hashes**: Computing and storing both `sha256Plaintext` and `sha256Ciphertext` for strict digital chain-of-custody.
- **Authenticated Decryption & Download**: Secure retrieval endpoint that verifies the GCM auth tag and streams decrypted evidence back to authorized users.

**Should have (competitive):**
- **Live Ingestion Progress UI**: Real-time feedback in `IngestEvidenceModal` displaying cryptographic hashing, encryption, and Supabase commit phases.
- **Merkle Checkpoint Binding**: Automatically updating Merkle leaf hashes with newly ingested encrypted evidence records.
- **Tamper Alerting**: Raising a security alert if GCM auth tag validation or ciphertext SHA-256 checks fail during retrieval.

**Defer (v2+):**
- Client-side zero-knowledge key derivation (user password derived keys).
- Hardware security module (HSM) / AWS KMS / Vault cloud integrations.

### Architecture Approach

The architecture cleanly decouples the React frontend from master encryption secrets:
1. **Frontend**: React components (`IngestEvidenceModal`, `CreateCaseModal`, `DocumentsView`) collect inputs and dispatch requests to `/api/evidence` and `/api/cases`.
2. **Backend Engine (`server/crypto.ts`)**: Encapsulates AES-256-GCM primitives, ensuring `crypto.randomBytes(12)` is called freshly for each encryption, and enforcing `decipher.setAuthTag()` verification.
3. **Backend Service (`server/index.ts`)**: Express server coordinating file processing, crypto operations, and persistence via `@supabase/supabase-js`.
4. **Supabase Cloud**: Receives encrypted binary blobs in `evidence-vault` bucket and encrypted records in database tables.

### Critical Pitfalls

1. **IV (Nonce) Reuse**: Never reuse an IV with the same AES-256 key. Always use `crypto.randomBytes(12)` per payload.
2. **Authentication Tag Skipping**: Always call `decipher.setAuthTag(tag)` and ensure `decipher.final()` succeeds before returning decrypted data.
3. **Key Leakage**: Keep `ENCRYPTION_KEY` strictly in backend `.env.local`; never expose via `VITE_` frontend variables.
4. **Memory Exhaustion**: Enforce file upload size limits or buffer streaming on multipart endpoints.
5. **Storage Bucket Missing**: Ensure the backend initializes and verifies the `evidence-vault` bucket exists in Supabase.

## Implications for Roadmap

The research dictates a logical 3-phase execution order:
1. **Phase 9: Backend Server & AES-256-GCM Crypto Engine**: Implement `server/crypto.ts` with `node:crypto` AES-256-GCM encryption/decryption, SHA-256 hashing, master key loading, and test verification suite.
2. **Phase 10: Supabase Storage & Field-Level Persistence API**: Create Express API endpoints for evidence upload, Supabase Storage `evidence-vault` bucket integration, and field-level encrypted table inserts.
3. **Phase 11: Frontend Modal Integration & Decrypted Retrieval Pipeline**: Wire `IngestEvidenceModal`, `CreateCaseModal`, and `DocumentsView` to the backend API with real-time cryptographic visual feedback and authenticated download verification.

## Sources
- Node.js Official Documentation: `node:crypto` Cipher and Decipher (GCM mode)
- NIST SP 800-38D: Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)
- Supabase Documentation: Storage API & JavaScript Client Reference
