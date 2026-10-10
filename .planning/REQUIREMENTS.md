# Requirements: Sentinel DMS

**Defined:** 2026-10-10  
**Core Value:** Providing a premium, modern, and highly polished interface for secure document and case management with verified cryptographic integrity.  

## v1.3 Requirements

### Cryptography Core
- [ ] **CRYPTO-01**: System can encrypt evidence files and data payloads using Node.js inbuilt `node:crypto` AES-256-GCM with a 32-byte master key, unique 12-byte random IV, and 16-byte authentication tag.
- [ ] **CRYPTO-02**: System computes SHA-256 digests for plaintext and ciphertext payloads, enabling verified digital chain-of-custody.
- [ ] **CRYPTO-03**: System authenticates and decrypts payloads via `node:crypto.createDecipheriv` with GCM tag verification, rejecting tampered data.

### Storage & Persistence
- [ ] **STORE-01**: Express backend API handles multipart file uploads and persists AES-256-GCM encrypted payloads to Supabase Storage (`evidence-vault`).
- [ ] **STORE-02**: System provides field-level AES-256-GCM encryption for sensitive database fields when writing records to Supabase tables.
- [ ] **STORE-03**: Backend API provides authenticated download and streaming decryption with MIME-type headers.

### Ingestion & Workflow
- [ ] **INGEST-01**: Ingest Evidence Modal connects to the backend API, displaying real-time cryptographic hashing, AES-256-GCM encryption, and Supabase commit progress.
- [ ] **INGEST-02**: Documents view allows inspecting cryptographic metadata (IV, auth tag, SHA-256 hashes) and initiating verified download.

## Future Requirements

- **KMS-01**: External Hardware Security Module (HSM) or AWS KMS / Vault key management integration.
- **ZK-01**: Zero-knowledge client-side encryption derived from user passphrases.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Client-side pure JS encryption | Exposes master secret key in the browser; `node:crypto` backend service keeps keys secure. |
| Encrypting indexed search keys | Would break database indexing and fast case search queries in Supabase Postgres. |
| In-browser video streaming decryption | High memory usage; evidence download and file viewing is preferred for forensic integrity. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRYPTO-01 | | Pending |
| CRYPTO-02 | | Pending |
| CRYPTO-03 | | Pending |
| STORE-01 | | Pending |
| STORE-02 | | Pending |
| STORE-03 | | Pending |
| INGEST-01 | | Pending |
| INGEST-02 | | Pending |

**Coverage:**
- v1.3 requirements: 8 total
- Mapped to phases: 0
- Unmapped: 8

---
*Requirements defined: 2026-10-10*  
*Last updated: 2026-10-10 after milestone v1.3 initialization*  
