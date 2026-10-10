# Phase 09: Node.js AES-256-GCM Crypto Engine & Master Key Configuration - Context

**Gathered:** 2026-10-10  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Build the server-side cryptographic core module in Node.js using `node:crypto` with AES-256-GCM authenticated encryption/decryption, CSPRNG 12-byte IV generation, 16-byte authentication tag verification, SHA-256 digest computation (plaintext and ciphertext), master secret key environment validation, and automated verification test script. This phase establishes the cryptographic engine needed by downstream persistence endpoints in Phase 10.

</domain>

<decisions>
## Implementation Decisions

### Master Key Provisioning & Validation
- **D-01:** Master encryption key is configured as a 64-character hex string (32 bytes / 256 bits) in `ENCRYPTION_KEY` in `.env.local`. The crypto module validates on startup that the key exists and resolves to exactly 32 bytes Buffer, throwing an immediate fatal configuration error if missing or improperly sized. — **Reversibility:** costly — key format and size dictate the cryptographic cipher and all future ciphertext decryptions.

### Payload Envelope & Binary Structure
- **D-02:** Dual-envelope format:  
  1. For file payloads (Supabase Storage): Compact packed Buffer format `[12-byte IV][16-byte Auth Tag][Ciphertext]` allowing streaming and atomic blob storage.  
  2. For field-level text / database records: Structured representation `{ iv: string, authTag: string, ciphertext: string }` or compact string serialization `gcm:${iv}:${authTag}:${ciphertext}`. — **Reversibility:** costly — payload packaging format is burned into all stored records and storage files.

### Tamper Detection & Error Handling Policy
- **D-03:** Explicit `CryptoTamperError` class thrown whenever `decipher.final()` fails GCM tag verification or payload tampering occurs. Returns descriptive `TAMPER_DETECTED` status code and forensic audit details without leaking sensitive plaintext or key material. — **Reversibility:** reversible — internal error taxonomy.

### Automated Testing & Verification
- **D-04:** Standalone TypeScript test script `server/crypto.test.ts` runnable via `npx tsx server/crypto.test.ts` and registered in `package.json` scripts as `"test:crypto": "tsx server/crypto.test.ts"`. Tests round-trip encryption/decryption, NIST test vectors, bit-flip tamper rejection, random IV uniqueness, and SHA-256 digests. — **Reversibility:** reversible.

### the agent's Discretion
- Exact helper function signatures in `server/crypto.ts` (`encryptFileBuffer`, `decryptFileBuffer`, `encryptField`, `decryptField`, `sha256`).
- Implementation of mock or development key loader for local testing if explicitly enabled via flag.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — Requirements CRYPTO-01, CRYPTO-02, CRYPTO-03
- `.planning/ROADMAP.md` — Phase 9 goal and success criteria
- `.planning/research/SUMMARY.md` — Executive summary of Node.js crypto architecture
- `.planning/research/STACK.md` — Recommended stack: `node:crypto`, `tsx`, `dotenv`
- `.planning/research/PITFALLS.md` — Critical pitfalls: IV reuse prevention, GCM auth tag verification

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json`: Already includes `express`, `dotenv`, `@types/node`, and `tsx`.
- `src/lib/utils.ts`: Contains UI utility helpers; crypto stays strictly in `server/` to avoid leaking keys to client bundle.

### Established Patterns
- ES Modules (`"type": "module"` in `package.json`).
- TypeScript configured with ESNext module resolution.

### Integration Points
- `server/crypto.ts`: Core cryptographic module.
- `server/crypto.test.ts`: Verification script.
- `.env.local`: Environment variable storage for `ENCRYPTION_KEY`.

</code_context>

<specifics>
## Specific Ideas

- Ensure `crypto.randomBytes(12)` is called for every single encryption operation to guarantee 100% IV uniqueness.
- Both plaintext SHA-256 and ciphertext SHA-256 must be computed using `crypto.createHash('sha256')`.

</specifics>

<deferred>
## Deferred Ideas

- Supabase Storage upload and Express multipart routes deferred to Phase 10.
- Frontend Ingest Evidence Modal integration deferred to Phase 11.

</deferred>

---

*Phase: 09-Node.js AES-256-GCM Crypto Engine & Master Key Configuration*  
*Context gathered: 2026-10-10*  
