# Roadmap (Milestone v1.3: AES-256-GCM Encryption & Secure Storage)

## Phase 9: Node.js AES-256-GCM Crypto Engine & Master Key Configuration (Completed)
**Goal:** Implement the cryptographic core module in Node.js using `node:crypto` with AES-256-GCM authenticated encryption/decryption, SHA-256 digests, CSPRNG 12-byte IV generation, and 16-byte authentication tag verification.  
**Requirements:** 
- CRYPTO-01: AES-256-GCM Encryption Engine
- CRYPTO-02: Plaintext & Ciphertext SHA-256 Hashing
- CRYPTO-03: Authenticated Decryption with Tag Verification

**Success Criteria:**
1. Node.js crypto module successfully encrypts binary buffers and strings using AES-256-GCM with unique 12-byte IVs and 16-byte authentication tags.
2. SHA-256 digests are computed for plaintext and ciphertext payloads to establish digital chain of custody.
3. Decryption validates the GCM authentication tag, rejecting tampered payloads with descriptive error states.

---

## Phase 10: Backend Persistence API & Supabase Storage Integration (Completed)
**Goal:** Build Express backend server endpoints to handle multipart evidence file uploads, write encrypted payloads to Supabase Storage (`evidence-vault`), and store encrypted records with field-level encryption in Supabase tables.  
**Requirements:** 
- STORE-01: Multipart Upload to Supabase Storage Bucket
- STORE-02: Field-Level Encryption for Database Records
- STORE-03: Authenticated Download & Streaming Decryption API

**Success Criteria:**
1. Express endpoint `/api/evidence/upload` receives file uploads, encrypts payloads via `node:crypto`, and persists them to Supabase Storage `evidence-vault`.
2. Sensitive fields in database records (e.g. descriptions, witness notes) are encrypted at the field level before Supabase table insertion.
3. Download endpoint `/api/evidence/:id/download` retrieves encrypted files from Supabase Storage, decrypts with tag verification, and streams back the original file with proper headers.

---

## Phase 11: Frontend Modal Integration & Verified Cryptographic Pipeline (Completed)
**Goal:** Connect the Ingest Evidence Modal, Create Case Modal, and Documents view to the backend cryptographic API, showing real-time encryption feedback and enabling verified evidence downloads.  
**Requirements:** 
- INGEST-01: Real-Time Cryptographic Ingestion Modal
- INGEST-02: Cryptographic Proof Inspection & Verified Download

**Success Criteria:**
1. Ingest Evidence Modal uploads files through the backend API with visual indicators for hashing, AES-256-GCM encryption, and Supabase commit.
2. Documents view displays cryptographic proofs (IV, auth tag, SHA-256 hashes) and allows users to download and inspect decrypted evidence.
3. Merkle checkpoint sequence updates with the newly committed evidence leaf hash.
