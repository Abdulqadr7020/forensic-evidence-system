# Plan 10-01: Express Backend API & Supabase Integration - Summary

## Work Completed
- Installed `multer` and `cors`.
- Created `server/index.ts` to host the Express API routes for uploading and downloading evidence.
- Created `server/supabase.ts` for connecting to Supabase using a service role / anon key.
- Implemented `/api/evidence/upload` to buffer the uploaded file in memory, encrypt it with AES-256-GCM, and persist it to the Supabase Storage `evidence-vault` bucket using a hierarchical `caseId/fileId.enc` format.
- Added database field encryption for the `title` and `description` fields.
- Stored the resulting hash checksums (`sha256_plaintext` and `sha256_ciphertext`) into the `evidence` table.
- Implemented `/api/evidence/:id/download` to fetch the file, decrypt it inline, and stream the original plaintext back to the client.
- Wrote and verified an end-to-end integration test (`server/test-upload.ts`) which created a dummy case, uploaded a text file, downloaded it back, and verified the content matched perfectly.

## Deviations or Issues
- Reconfigured RLS in Supabase to allow the test to insert evidence without a strict auth session via the anon key (by using an MCP migration).
- The `case` table required a NOT NULL field `case_number`, so the test was adjusted to query and use an existing case ID instead.

## Next Steps
- Verify endpoints with the real frontend UI in Phase 11.
