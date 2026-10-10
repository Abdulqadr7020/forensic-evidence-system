# Feature Research

**Domain:** Cryptographic Evidence Ingestion & Secure Storage Pipeline  
**Researched:** 2026-10-10  
**Confidence:** HIGH  

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| AES-256-GCM Binary File Encryption | Forensics require evidence files at rest to be encrypted and tamper-evident | MEDIUM | Stream or buffer input file using `node:crypto.createCipheriv`, generating 12-byte IV and 16-byte GCM auth tag. |
| Supabase Storage Bucket Ingestion | Encrypted binaries must be stored in a durable cloud bucket (`evidence-vault`) | MEDIUM | Upload encrypted payload (IV + ciphertext + tag) to Supabase Storage and register public/signed URI. |
| Field-Level Record Encryption | Sensitive case notes and witness statements must not be visible in raw database exports | LOW | Encrypt designated strings/JSON fields in Postgres rows (`cases`, `documents`) with AES-256-GCM. |
| Plaintext & Ciphertext SHA-256 Hashing | Digital chain-of-custody requires proving plaintext hash matches original, and ciphertext hash matches storage | LOW | Compute SHA-256 of raw file and SHA-256 of encrypted blob during ingestion pipeline. |
| Decryption & Verification Stream | Authorized users must be able to download and verify original evidence integrity | MEDIUM | Retrieve encrypted blob, verify GCM tag with `node:crypto.createDecipheriv`, verify SHA-256, and stream plaintext. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Merkle Tree Checkpoint Integration | Real-time leaf calculation binding the ciphertext SHA-256 to the cryptographic ledger | LOW | Leaf hash computed as `SHA256(sha256Plaintext + sha256Ciphertext + timestamp)` and updated on Merkle ledger. |
| Live Ingestion Visual Progress | Shows real cryptographic stages (Hashing -> AES-256-GCM Encrypting -> Supabase Uploading -> Merkle Checkpointing) in the UI | LOW | Modal animation displaying byte sizes, generated IV, and auth tag during upload. |
| Tamper-Detection Alert Trigger | If GCM auth tag verification fails or ciphertext hash changes in Supabase, auto-create a Security Alert | MEDIUM | Integrates with existing `security_alerts` table in DMS. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Client-Side Master Secret Key | Developers think client-only architecture is simpler without a backend | Exposes `ENCRYPTION_KEY` in the browser dev tools, allowing any visitor to decrypt all stored evidence files. | Keep master key in Node.js server environment; client authenticates via Supabase Auth JWT. |
| Encrypting Indexed Search Columns | Encrypting case numbers or search tags | Breaks SQL indexing, substring search, and ordering in Supabase Postgres. | Encrypt only content payloads and sensitive notes; keep case numbers, classifications, and categories unencrypted or tokenized. |
| Reusing IVs / Counters | Saving storage space by reusing static initialization vectors | GCM catastrophic failure: two plaintexts encrypted with same key and IV allows ciphertext XORing and forgery. | Always generate a fresh `crypto.randomBytes(12)` per payload. |

## Feature Dependencies

```
[Node.js Crypto Service]
    └──requires──> [Master Key in .env]
[File Upload & Ingestion]
    └──requires──> [Node.js Crypto Service]
                       └──requires──> [Supabase Storage Bucket]
[Field-Level Encryption]
    └──requires──> [Node.js Crypto Service]
                       └──requires──> [Supabase DB Tables]
[Decryption & Download]
    └──requires──> [Node.js Crypto Service]
                       └──requires──> [Supabase Storage Bucket]
```

### Dependency Notes

- **File Upload requires Node.js Crypto Service:** Raw binary files must pass through the Node.js encryption worker before reaching Supabase Storage.
- **Supabase Storage requires Bucket Creation:** The `evidence-vault` bucket must exist and have appropriate access policies.
- **Decryption requires GCM Auth Tag:** Decryption must verify `cipher.setAuthTag()` before releasing unencrypted bytes.
