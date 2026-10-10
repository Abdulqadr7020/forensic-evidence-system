# Phase 10: Backend Persistence API & Supabase Storage Integration - Discussion Log

**Date:** 2026-10-10  

This log captures the raw discussion that led to the decisions in `10-CONTEXT.md`. It is for human reference and audit purposes.

---

## 1. Multipart Upload Handling

**Options Considered:**
- **(Recommended) Buffer in memory** — Easier to implement and calculate the hash, suitable for standard document files (PDF, images).
- **Stream directly** — Harder to implement but necessary if we expect huge files (e.g. gigabytes of video).

**Decision:** Buffer in memory

**Reasoning / Notes:** 
User selected buffering to simplify implementation, since expected documents are standard files (PDF, images) rather than huge videos.

---

## 2. Supabase Bucket Layout

**Options Considered:**
- **(Recommended) Hierarchical** — Use `case_id/file_id.enc` so files are grouped by case, making cleanup and permissions easier.
- **Flat** — Store everything in the root with `uuid.enc` and rely purely on the database for organization.

**Decision:** Hierarchical

**Reasoning / Notes:** 
User prefers grouping encrypted files by case ID within the bucket to ease permissions and lifecycle cleanup.

---

## 3. Database Field Encryption Scope

**Options Considered:**
- **(Recommended) Just sensitive fields** (descriptions, notes, PII). Leave titles/names as plaintext so they can be searched quickly in the UI.
- **Encrypt everything** (titles, names, descriptions). Security is paramount, even if it means losing search capabilities on names.

**Decision:** Encrypt everything

**Reasoning / Notes:** 
User prioritized absolute security over server-side search capabilities. Titles, names, and descriptions will all be field-encrypted before hitting Supabase.

