# Phase 10: Backend Persistence API & Supabase Storage Integration - Context

**Gathered:** 2026-10-10  
**Status:** Ready for planning  

<domain>
## Phase Boundary

Build Express backend server endpoints to handle multipart evidence file uploads, write encrypted payloads to Supabase Storage (`evidence-vault`), and store encrypted records with field-level encryption in Supabase tables.
</domain>

<decisions>
## Implementation Decisions

### Multipart Upload Handling
- **D-01:** Buffer uploads completely in memory before encrypting. This makes calculating the hash easier and is suitable for standard document files (PDFs, images) expected in the system. — **Reversibility:** reversible — memory usage limits can be refactored to streaming if file limits increase later.

### Supabase Bucket Layout
- **D-02:** Use a hierarchical storage layout structured as `case_id/file_id.enc`. This ensures files are grouped by case natively in Supabase Storage, making cleanup and permission-setting easier. — **Reversibility:** costly — bucket layout changes would require migrating all stored objects.

### Database Field Encryption Scope
- **D-03:** Encrypt everything (titles, names, descriptions). Security is paramount, even if it means losing server-side search capabilities on those fields. — **Reversibility:** costly — migrating encrypted fields back to plaintext would require full table rewrites.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements & Roadmap
- `.planning/ROADMAP.md` — Phase 10 goal and success criteria
- `.planning/REQUIREMENTS.md` — Phase 10 requirements (STORE-01, STORE-02, STORE-03)
- `.planning/phases/09-node-js-aes-256-gcm-crypto-engine-master-key-configuration/09-CONTEXT.md` — Phase 9 decisions that drive encryption payload structure.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/crypto.ts`: Provides `encryptFileBuffer`, `decryptFileBuffer`, `encryptField`, `decryptField`, `sha256`.

### Integration Points
- Express server routes (`/api/evidence/upload`, `/api/evidence/:id/download`).
- Supabase JS Client for database and storage interaction.
</code_context>

---

*Phase: 10-Backend Persistence API & Supabase Storage Integration*  
*Context gathered: 2026-10-10*  
