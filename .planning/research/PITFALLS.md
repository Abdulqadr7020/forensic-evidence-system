# Pitfalls Research

**Domain:** Cryptographic Evidence Ingestion & Secure Storage Pipeline  
**Researched:** 2026-10-10  
**Confidence:** HIGH  

## Critical Pitfalls

### Pitfall 1: IV (Nonce) Reuse in AES-256-GCM

**What goes wrong:**
If the same 12-byte IV is ever reused with the same 256-bit encryption key across two different files or records, GCM security catastrophically fails. An adversary can XOR the ciphertexts to recover plaintext relationships and forge authentication tags.

**Why it happens:**
Developers mistakenly use a static IV (e.g. `Buffer.alloc(12, 0)`), derive IV deterministically without salt, or fail to use `crypto.randomBytes(12)` for each encryption operation.

**How to avoid:**
Always call `crypto.randomBytes(12)` freshly inside the encryption function for every single file or field encryption. Store the unique 12-byte IV alongside the ciphertext.

**Warning signs:**
Repeated IV values appearing in the database or storage metadata; static initialization vectors in code.

**Phase to address:**
Phase 1 (Crypto Core Implementation).

---

### Pitfall 2: Failing to Verify the GCM Authentication Tag Prior to Decryption

**What goes wrong:**
If the authentication tag is ignored or set incorrectly, tampered ciphertext will produce corrupted plaintext without throwing an error, undermining forensic integrity.

**Why it happens:**
Developers treat GCM like standard CBC/CTR without calling `decipher.setAuthTag(tag)`.

**How to avoid:**
Extract the 16-byte authentication tag from the payload, pass it to `decipher.setAuthTag(authTag)`, and wrap `decipher.final()` in error handling. `decipher.final()` will throw `Unsupported state or unable to authenticate data` if any bit of the ciphertext, IV, or tag was tampered with.

**Warning signs:**
Decryption succeeds even when bytes in the storage payload are modified.

**Phase to address:**
Phase 1 (Crypto Core Implementation).

---

### Pitfall 3: Storing Master Encryption Key in Browser or Git

**What goes wrong:**
If `ENCRYPTION_KEY` is placed in client-side code, prefixed with `VITE_`, or committed to git repository, any user or attacker can read the key and decrypt all evidence files.

**Why it happens:**
Convenience during development or trying to perform all crypto in the client browser.

**How to avoid:**
Keep `ENCRYPTION_KEY` strictly in server-side `.env.local` loaded by Node.js. Ensure `.env*` is in `.gitignore`. Never prefix backend secrets with `VITE_`.

**Warning signs:**
`VITE_ENCRYPTION_KEY` present in frontend code or bundle.

**Phase to address:**
Phase 1 (Backend & Environment Setup).

---

### Pitfall 4: Memory Exhaustion on Large File Uploads

**What goes wrong:**
Loading 500MB+ forensic disk images or video files entirely into memory (`Buffer.from`) before encrypting crashes the Node.js server with Out-Of-Memory (OOM).

**Why it happens:**
Using `multer.memoryStorage()` for arbitrarily large files without size limits or streaming.

**How to avoid:**
Set reasonable size limits on upload endpoints (e.g. 50MB for demo/browser ingestion) or use Node.js streams (`crypto.createCipheriv` stream piped to Supabase Storage).

**Warning signs:**
Node process crashing with `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.

**Phase to address:**
Phase 2 (File Upload & Storage Ingestion).

---

### Pitfall 5: Unhandled Missing Bucket in Supabase Storage

**What goes wrong:**
Uploads fail with `404 Bucket not found` if `evidence-vault` bucket has not been created in the Supabase project.

**Why it happens:**
Assuming Supabase automatically creates custom storage buckets on file upload.

**How to avoid:**
Include initialization logic on server startup that checks if `evidence-vault` exists via `supabase.storage.getBucket('evidence-vault')` and automatically creates it if missing, or provides graceful fallback.

**Warning signs:**
Upload endpoint returning 500 internal server error with `Bucket not found`.

**Phase to address:**
Phase 2 (File Upload & Storage Ingestion).
