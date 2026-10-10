# Phase 11: Frontend Modal Integration & Verified Cryptographic Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.  
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-10  
**Phase:** 11-Frontend Modal Integration & Verified Cryptographic Pipeline  
**Areas discussed:** Cryptographic Ingestion Pipeline UX, Evidence Decryption & Download UX, Document Registry Data Synchronization, Merkle Ledger Sequence & Checkpoint Update  

---

## Cryptographic Ingestion Pipeline UX

| Option | Description | Selected |
|--------|-------------|----------|
| Animated multi-step cards inside the modal | Visual step items with active spinners, transition checkmarks, and live truncated hex hash previews for Plaintext SHA-256, AES-256-GCM, Ciphertext SHA-256, and Supabase Vault Commit. | ✓ |
| Compact status bar with dynamic badges | A sleek linear progress bar accompanied by glowing security status badges indicating current cryptographic state. | |
| Cryptographic Terminal view | A retro-futuristic dark monospaced console window rendering live cryptographic operations log lines with timestamps. | |

**User's choice:** Animated multi-step cards inside the modal  
**Notes:** Chosen for visual clarity and polish aligned with Sentinel DMS design language.

| Option | Description | Selected |
|--------|-------------|----------|
| Paced visual transition (~350ms per step) | Smoothly step through each stage (Plaintext Digest -> AES-256-GCM Encryption -> Ciphertext Digest -> Supabase Storage & DB Insert) so officers can visually witness and verify the cryptographic integrity pipeline. | ✓ |
| Instant reveal on HTTP 201 | Show a loading state until the backend response returns, then immediately reveal all cryptographic proofs and complete checkmarks at once. | |
| Client-side WebCrypto pre-hash | Frontend computes plaintext SHA-256 digest in the browser first via window.crypto.subtle, sends file to backend, then updates with backend AES-256-GCM and ciphertext hash. | |

**User's choice:** Paced visual transition (~350ms per step)  
**Notes:** Pacing provides clear evidence of zero-trust verification stages.

| Option | Description | Selected |
|--------|-------------|----------|
| Cryptographic Ingestion Receipt view in modal | Switch to a completed verification screen showing the permanent Evidence ID, Merkle leaf commitment, IV, and hashes with a "Copy Proof" button and "Done" button. | ✓ |
| Immediate auto-close with persistent toast | Automatically dismiss the modal upon completion and display a rich glassmorphic toast notification containing the commitment confirmation. | |
| Modal receipt + Download verification certificate | In addition to the receipt summary, offer a one-click button to download a signed cryptographic audit receipt (JSON). | |

**User's choice:** Cryptographic Ingestion Receipt view in modal  
**Notes:** Provides a definitive proof-of-custody confirmation screen.

| Option | Description | Selected |
|--------|-------------|----------|
| Detailed In-Modal Step Failure & Retry | Mark the specific failing step (e.g., Vault Upload or DB Commit) with a red alert badge, display the server error explanation, and keep form inputs intact so the user can easily retry. | ✓ |
| Form reset with Error Toast | Reset the modal back to initial state and trigger a global red error toast notification with error message. | |
| Technical Diagnostic Modal | Show an expander with the full error stack, request payload headers, and a "Copy Error Report" button for system administrators. | |

**User's choice:** Detailed In-Modal Step Failure & Retry  
**Notes:** Keeps form data intact to prevent user frustration upon network blips.

---

## Evidence Decryption & Download UX

| Option | Description | Selected |
|--------|-------------|----------|
| Verification Modal with Streamed Download | An inspection modal that displays the GCM authentication status, hashes, and an active "Download Decrypted File" button. | |
| Direct Download with Success Toast | Direct one-click download icon button on table rows and folder cards that initiates GET /api/evidence/:id/download and triggers a verification toast upon success. | ✓ |
| Slide-over Drawer with Cryptographic Inspector | A slide-over sheet panel displaying cryptographic properties and an integrated download trigger. | |

**User's choice:** Direct Download with Success Toast  
**Notes:** Fast, intuitive single-click experience for daily operations.

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve original file name | Return the original uploaded filename (e.g. CCTV_Footage_01.mp4) in the Content-Disposition header so the file is saved locally with its actual name and extension. | ✓ |
| Prefixed audit filename | Save with case and ID prefix (e.g. CR-2026-0104_DOC-1024_original_name.ext) for forensic tracking. | |
| Evidence ID with detected extension | Save as evidence-[uuid].[ext] based on mime-type. | |

**User's choice:** Preserve original file name  
**Notes:** Essential for user recognition and application compatibility.

| Option | Description | Selected |
|--------|-------------|----------|
| High-Severity Security Alert Modal | Display a dedicated critical alert modal warning that ciphertext tampering was detected by AES-256-GCM verification, preventing any corrupted file write. | ✓ |
| Urgent Red Toast Notification | Show a sticky red toast banner stating cryptographic integrity verification failed (TAMPER_DETECTED). | |
| Update Integrity Badge to TAMPERED + Alert Toast | Instantly flip the document's integrity status to 'COMPROMISED' in the table and show an alert. | |

**User's choice:** High-Severity Security Alert Modal  
**Notes:** Strong security posture prevents silent corruption or tampering oversight.

| Option | Description | Selected |
|--------|-------------|----------|
| Enhanced Proof Card in VerificationResultModal | Display the verified cryptographic parameters (AES-256-GCM authenticated status, 12-byte IV hex, 16-byte Auth Tag hex, Plaintext & Ciphertext SHA-256 digests) with one-click copy buttons. | ✓ |
| Tabbed Modal View | Separate the verification modal into tabs for "AES-256-GCM Proofs" and "Merkle Tree Consistency". | |
| Inline expandable table rows | Expandable drawer directly underneath each row in the Documents table to inspect raw cryptographic fields. | |

**User's choice:** Enhanced Proof Card in VerificationResultModal  
**Notes:** Extends the existing high-polish verification dialog cleanly.

---

## Document Registry Data Synchronization

| Option | Description | Selected |
|--------|-------------|----------|
| Backend Endpoint GET /api/evidence | Express server fetches evidence rows, decrypts field-level encrypted titles/descriptions server-side using the master key, and serves decrypted document records with cryptographic proofs directly to DocumentsView. | ✓ |
| Dual-Table Insert on Upload | During /api/evidence/upload, insert into both 'evidence' and 'documents' tables. | |
| Optimistic Client State Prepend | Convert the server upload receipt into a DocumentRecord and prepend directly to React state in DocumentsView without re-fetching. | |

**User's choice:** Backend Endpoint GET /api/evidence  
**Notes:** Enforces server-side security contract: client never touches the master key.

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic Case Selector | IngestEvidenceModal fetches live cases from Supabase/API via fetchCases(), displaying case number and case title so evidence is always linked to valid database case UUIDs. | ✓ |
| Curated Case Select mapped to seeded UUIDs | Use styled select dropdown pre-mapped to the primary seeded case IDs. | |
| Searchable Combobox | An autocomplete combobox component for filtering across all active police cases. | |

**User's choice:** Dynamic Case Selector  
**Notes:** Ensures evidence is always attached to legitimate database records.

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic Backend Update | In /api/evidence/upload, automatically increment the case's document_count and update last_activity_at to current timestamp in the 'cases' table. | ✓ |
| PostgreSQL Database Trigger | Add an SQL trigger in Supabase on public.evidence to auto-increment case document counts on insert. | |
| Dynamic aggregation | Count evidence per case dynamically in query/frontend without storing a counter column. | |

**User's choice:** Automatic Backend Update  
**Notes:** Straightforward atomic transaction in Express backend route.

| Option | Description | Selected |
|--------|-------------|----------|
| Optimistic Append + Background Re-fetch | Immediately insert the newly returned evidence record at the top of DocumentsView state and re-fetch cases in the background to ensure zero lag and seamless responsiveness. | ✓ |
| Immediate View Re-fetch on Modal Close | Re-call fetchDocuments() and fetchCases() as soon as the ingestion receipt is closed. | |
| Supabase Realtime Channel | Listen to Postgres realtime INSERT events on the evidence table to automatically stream updates. | |

**User's choice:** Optimistic Append + Background Re-fetch  
**Notes:** Delivers best-in-class instant visual feedback.

---

## Merkle Ledger Sequence & Checkpoint Update

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side Merkle leaf generation | The backend computes merkleLeafHash = sha256(sha256Ciphertext + evidenceId) during /api/evidence/upload and returns it in the upload receipt. | ✓ |
| Client-side Merkle leaf calculation | The frontend derives the leaf hash using the received ciphertext hash and evidence ID. | |
| Merkle leaf based strictly on ciphertext digest | The leaf hash is directly set to the ciphertext SHA-256 digest itself. | |

**User's choice:** Server-side Merkle leaf generation  
**Notes:** Cryptographic hash derivation remains authoritative on the server.

| Option | Description | Selected |
|--------|-------------|----------|
| Automated Supabase Checkpoint Update | In /api/evidence/upload, automatically create the next Merkle checkpoint record in Supabase (e.g. sequence #105, incremented leaf_count, new root_hash) so all views show the updated sequence. | ✓ |
| Optimistic frontend sequence increment | Return next sequence number (#105) from upload API and update the UI state. | |
| Explicit 'Commit Checkpoint' action | Evidence is staged with pending checkpoint status until an officer clicks 'Anchor Checkpoint' in IntegrityView. | |

**User's choice:** Automated Supabase Checkpoint Update  
**Notes:** Keeps database and UI fully in sync at all times.

| Option | Description | Selected |
|--------|-------------|----------|
| Global Checkpoint State with Subtle Flash Animation | Store current checkpoint sequence in shared context/state so header badge and IntegrityView update instantly to #105 with a subtle glowing pulse animation. | ✓ |
| Audit Toast Notification | Trigger a high-priority security toast stating 'Merkle Ledger Advanced: Sequence #105 anchored' upon upload completion. | |
| Navigation-based fetch | Fetch latest checkpoint only when navigating into IntegrityView. | |

**User's choice:** Global Checkpoint State with Subtle Flash Animation  
**Notes:** Visually reinforces the live blockchain/Merkle tree progression.

| Option | Description | Selected |
|--------|-------------|----------|
| Live verification against active checkpoint | VerificationResultModal verifies the document's leaf hash against the active checkpoint root hash and sequence, displaying authenticated green checkmarks across all integrity criteria. | ✓ |
| Backend verification endpoint | Add GET /api/evidence/:id/verify to have the backend compute and validate the cryptographic proof. | |
| Pre-computed receipt verification | Read the stored sha256_ciphertext, merkle_leaf_hash, and checkpoint_sequence from the database record and verify invariant locally. | |

**User's choice:** Live verification against active checkpoint  
**Notes:** Guarantees real-time zero-trust proof inspection.

---

## the agent's Discretion
None — all key interaction patterns and architecture decisions were agreed upon during discussion.

## Deferred Ideas
None — discussion stayed strictly within the phase scope.
