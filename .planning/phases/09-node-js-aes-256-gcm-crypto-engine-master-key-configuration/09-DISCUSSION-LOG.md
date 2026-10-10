# Phase 09: Node.js AES-256-GCM Crypto Engine & Master Key Configuration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-10  
**Phase:** 09-Node.js AES-256-GCM Crypto Engine & Master Key Configuration  
**Areas discussed:** Master Key Provisioning & Validation, Payload Envelope & Binary Format, Tamper Handling & Error Policy, Testing & Verification Script  

---

## Master Key Provisioning & Validation

| Option | Description | Selected |
|--------|-------------|----------|
| 64-character Hex string (32 bytes) | 64-char hex in `ENCRYPTION_KEY` env var with strict validation on startup | ✓ |
| Base64 string | Base64-encoded 32 bytes | |
| Auto-generate fallback dev key | Accept either Hex/Base64, generate dev key if unset | |

**User's choice:** 64-character Hex string (32 bytes) in ENCRYPTION_KEY with strict validation on server startup  
**Notes:** Provides unambiguous byte representation and strict security hygiene.

---

## Payload Envelope & Binary Format

| Option | Description | Selected |
|--------|-------------|----------|
| Dual format | Packed Buffer `[12-byte IV + 16-byte Tag + Ciphertext]` for file blobs, and `{ iv, authTag, ciphertext }` for text/DB fields | ✓ |
| Packed Buffer only | Packed Buffer for both files and database fields | |
| Structured JSON only | JSON string envelope for everything | |

**User's choice:** Dual format: Packed Buffer `[12-byte IV + 16-byte Tag + Ciphertext]` for file blobs, and `{ iv, authTag, ciphertext }` for text/DB fields  
**Notes:** Packed Buffer enables atomic streaming storage in Supabase Storage without JSON encoding overhead; JSON format enables clean column persistence.

---

## Tamper Handling & Error Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Specialized CryptoTamperError | Returns explicit `TAMPER_DETECTED` status and forensic audit details | ✓ |
| Standard Error | Rejects decryption without forensic details | |

**User's choice:** Specialized CryptoTamperError returning explicit TAMPER_DETECTED status and forensic audit details  
**Notes:** Critical for forensic compliance and detecting tampered evidence in chain of custody.

---

## Testing & Verification Script

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone test runner script | `server/crypto.test.ts` runnable with `npx tsx server/crypto.test.ts` and added as `npm run test:crypto` | ✓ |
| Inline test function | Exported test function in `server/crypto.ts` | |

**User's choice:** Standalone test runner script server/crypto.test.ts runnable with `npx tsx server/crypto.test.ts` and added as `npm run test:crypto`  
**Notes:** Automated test verification ensures reproducible CI/CD checks for crypto contracts.

---

## the agent's Discretion

- Function naming and internal Buffer slicing helpers.
- Test vector selections for automated verification script.

## Deferred Ideas

- Supabase Storage upload endpoints deferred to Phase 10.
- Frontend Ingest Evidence Modal integration deferred to Phase 11.
