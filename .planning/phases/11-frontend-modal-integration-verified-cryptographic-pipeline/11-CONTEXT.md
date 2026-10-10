# Phase 11: Frontend Modal Integration & Verified Cryptographic Pipeline - Context

**Gathered:** 2026-10-10  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Connect the Ingest Evidence Modal, Create Case Modal, and Documents view to the backend cryptographic API, showing real-time encryption feedback and enabling verified evidence downloads.
</domain>

<decisions>
## Implementation Decisions

### Cryptographic Ingestion Pipeline UX
- **D-01:** Animated multi-step cards inside the modal: Visual step items with active spinners, transition checkmarks, and live truncated hex hash previews for Plaintext SHA-256, AES-256-GCM (12-byte IV + 16-byte tag), Ciphertext SHA-256, and Supabase Vault Commit. — **Reversibility:** reversible — UI presentation choice inside `IngestEvidenceModal.tsx`.
- **D-02:** Paced visual transition (~350ms per step): Smoothly step through each stage (Plaintext Digest -> AES-256-GCM Encryption -> Ciphertext Digest -> Supabase Storage & DB Insert) so officers can visually witness and verify the cryptographic integrity pipeline. — **Reversibility:** reversible — can adjust pacing timer constants in frontend.
- **D-03:** Cryptographic Ingestion Receipt view in modal: Once completed, switch the modal view to a completed verification screen displaying the permanent Evidence ID, Merkle leaf commitment, IV, and hashes with a "Copy Proof" button and "Done" button. — **Reversibility:** reversible — state rendering in modal.
- **D-04:** Detailed In-Modal Step Failure & Retry: Mark the specific failing step (e.g., Vault Upload or DB Commit) with a red alert badge, display the server error explanation, and keep form inputs intact so the user can easily retry. — **Reversibility:** reversible.

### Evidence Decryption & Download UX
- **D-05:** Direct Download with Success Toast: Direct one-click download icon button on table rows and folder cards in `DocumentsView` that initiates `GET /api/evidence/:id/download` and triggers a verification toast upon success. — **Reversibility:** reversible.
- **D-06:** Preserve original file name: Return the original uploaded filename (e.g., `CCTV_Footage_01.mp4`) in the `Content-Disposition` header from Express so the file is saved locally with its actual name and extension. — **Reversibility:** reversible.
- **D-07:** High-Severity Security Alert Modal: If `GET /api/evidence/:id/download` returns a 400 TAMPER_DETECTED error, display a dedicated critical alert modal warning that ciphertext tampering was detected by AES-256-GCM verification, preventing any corrupted file write. — **Reversibility:** reversible.
- **D-08:** Enhanced Proof Card in VerificationResultModal: Display verified cryptographic parameters (AES-256-GCM authenticated status, 12-byte IV hex, 16-byte Auth Tag hex, Plaintext & Ciphertext SHA-256 digests) with one-click copy buttons. — **Reversibility:** reversible.

### Document Registry Data Synchronization
- **D-09:** Backend Endpoint `GET /api/evidence`: Express server fetches evidence rows, decrypts field-level encrypted titles/descriptions server-side using the master key, and serves decrypted document records with cryptographic proofs directly to `DocumentsView`. — **Reversibility:** costly — standardizes the read contract between backend and frontend.
- **D-10:** Dynamic Case Selector: `IngestEvidenceModal` fetches live cases from Supabase/API via `fetchCases()`, displaying case number and case title so evidence is always linked to valid database case UUIDs. — **Reversibility:** reversible.
- **D-11:** Automatic Backend Update: In `/api/evidence/upload`, automatically increment the case's `document_count` and update `last_activity_at` to current timestamp in the `cases` table. — **Reversibility:** reversible.
- **D-12:** Optimistic Append + Background Re-fetch: Immediately insert the newly returned evidence record at the top of `DocumentsView` state and re-fetch cases in the background to ensure zero lag and seamless responsiveness. — **Reversibility:** reversible.

### Merkle Ledger Sequence & Checkpoint Update
- **D-13:** Server-side Merkle leaf generation: The backend computes `merkleLeafHash = sha256(sha256Ciphertext + evidenceId)` during `/api/evidence/upload` and returns it in the upload receipt. — **Reversibility:** costly — changes Merkle leaf calculation convention.
- **D-14:** Automated Supabase Checkpoint Update: In `/api/evidence/upload`, automatically create the next Merkle checkpoint record in Supabase (e.g. sequence #105, incremented `leaf_count`, new `root_hash`) so all views show the updated sequence. — **Reversibility:** costly — updates database schema sequence.
- **D-15:** Global Checkpoint State with Subtle Flash Animation: Store current checkpoint sequence in shared context/state so header badge and `IntegrityView` update instantly to #105 with a subtle glowing pulse animation. — **Reversibility:** reversible.
- **D-16:** Live verification against active checkpoint: `VerificationResultModal` verifies the document's leaf hash against the active checkpoint root hash and sequence, displaying authenticated green checkmarks across all integrity criteria. — **Reversibility:** reversible.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 11 goals and success criteria (INGEST-01, INGEST-02)
- `.planning/REQUIREMENTS.md` — Core requirements and verification criteria
- `.planning/phases/09-node-js-aes-256-gcm-crypto-engine-master-key-configuration/09-CONTEXT.md` — Cryptographic primitives and payload format
- `.planning/phases/10-backend-persistence-api-supabase-storage-integration/10-CONTEXT.md` — Backend endpoints and field-level encryption structure

### Existing Implementation Files
- `server/index.ts` — Express API endpoints (`/api/evidence/upload`, `/api/evidence/:id/download`)
- `server/crypto.ts` — Cryptographic engine (`encryptFileBuffer`, `decryptFileBuffer`, `encryptField`, `decryptField`)
- `server/supabase.ts` — Supabase Admin Client
- `src/components/modals/IngestEvidenceModal.tsx` — Ingestion modal component
- `src/views/DocumentsView.tsx` — Document registry view
- `src/components/security/VerificationResultModal.tsx` — Cryptographic proof inspection modal
- `src/services/db.ts` — Database client data service
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/modals/IngestEvidenceModal.tsx`: Existing modal with form fields for case assignment, evidence category, classification, and file upload.
- `src/components/security/VerificationResultModal.tsx`: Visual verification checklist with cryptographic hash displays and integrity indicators.
- `src/components/ui/FileUpload.tsx`: Drag-and-drop file upload component.
- `src/components/ui/EvidenceFolderCard.tsx` & `src/components/ui/Table.tsx`: Document display cards and tables in DocumentsView.
- `src/context/ToastContext.tsx`: Glassmorphic toast notification hook (`success`, `warning`, `error`).

### Established Patterns
- Dark mode glassmorphic UI tokens (`bg-[var(--surface-elevated)]`, `border-[var(--border)]`).
- Monospaced typography for IDs and cryptographic hashes (`font-mono text-xs`).
- Motion transitions for stepped animations and dialog overlays.

### Integration Points
- `http://localhost:3001/api/evidence/upload`: Target endpoint for multipart evidence ingestion.
- `http://localhost:3001/api/evidence/:id/download`: Target endpoint for authenticated streaming decryption.
- `GET /api/evidence`: New endpoint to be added to Express for fetching decrypted evidence lists.
- `merkle_checkpoints` table in Supabase: Contains current sequence #104.
</code_context>

<specifics>
## Specific Ideas
- Animated step-by-step cryptographic pipeline cards during upload:
  1. Digest: Computing SHA-256 Plaintext Hash
  2. Encrypt: AES-256-GCM with 12-byte CSPRNG IV & 16-byte Auth Tag
  3. Vault: Encrypted payload upload to Supabase `evidence-vault`
  4. Anchor: Merkle leaf commitment `#105` generated & DB record committed
- Seamless download: Direct download button on table and folder card triggers streaming decryption from Express with original filename preserved in header.
- Critical tamper modal: Displays a clear red warning dialog if authentication tag validation fails.
</specifics>

<deferred>
## Deferred Ideas
None — discussion stayed within phase scope.
</deferred>

---

*Phase: 11-Frontend Modal Integration & Verified Cryptographic Pipeline*  
*Context gathered: 2026-10-10*  
