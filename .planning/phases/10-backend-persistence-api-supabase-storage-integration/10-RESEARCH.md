# Phase 10: Backend Persistence API & Supabase Storage Integration - Research

## Context
- **Phase**: 10
- **Goal**: Build Express backend server endpoints to handle multipart evidence file uploads, write encrypted payloads to Supabase Storage (`evidence-vault`), and store encrypted records with field-level encryption in Supabase tables.

## 1. Domain Investigation
- **Dependencies**: 
  - `express`: Already installed (`^4.21.2`).
  - `multer`: Needed for multipart/form-data upload parsing.
  - `@supabase/supabase-js`: Already installed (`^2.117.3`).
- **Storage Bucket Layout**: Hierarchical `case_id/file_id.enc` (from D-02 in CONTEXT).
- **Encryption Workflow**: 
  1. `multer` parses the multipart request, placing the file buffer in memory.
  2. The buffer is encrypted using `encryptFileBuffer()` from `server/crypto.ts`.
  3. The resulting packed buffer (IV + Tag + Ciphertext) is uploaded to Supabase Storage.
  4. The metadata (title, notes) is encrypted using `encryptField()`.
  5. The encrypted metadata is stored in the Supabase database.
- **Decryption Workflow**:
  1. File is downloaded as an ArrayBuffer from Supabase Storage.
  2. The buffer is decrypted using `decryptFileBuffer()`.
  3. The plaintext buffer is streamed/sent back to the client with the correct `Content-Type`.

## 2. API Design
### `POST /api/evidence/upload`
- **Headers**: Authorization (Bearer token for Supabase Auth, verified via middleware).
- **Body (Multipart)**:
  - `file`: The binary file.
  - `caseId`: The ID of the case (for hierarchical storage and database linking).
  - `title`: Plaintext title (will be encrypted).
  - `description`: Plaintext description (will be encrypted).
- **Response**: `201 Created` with the new evidence record ID.

### `GET /api/evidence/:id/download`
- **Headers**: Authorization.
- **Response**: `200 OK` with the plaintext file buffer and appropriate `Content-Disposition`.

## 3. Database Schema Considerations
- Table: `evidence`
- Fields:
  - `id`: UUID (Primary Key)
  - `case_id`: UUID (Foreign Key)
  - `title`: Text (Encrypted `gcm:...`)
  - `description`: Text (Encrypted `gcm:...`)
  - `file_path`: Text (e.g., `case_id/file_id.enc`)
  - `content_type`: Text (e.g., `application/pdf`)
  - `sha256_plaintext`: Text (Hash from crypto)
  - `sha256_ciphertext`: Text (Hash from crypto)
  - `size_bytes`: Integer

## 4. Known Pitfalls & Constraints
- **Memory Limits**: `multer` will buffer files in memory (as decided in D-01). We must enforce a max file size limit (e.g., 50MB) to prevent OOM errors on the Node.js server.
- **Supabase Policies (RLS)**: Row Level Security in Supabase must allow the backend service role or the authenticated user to insert/select records and upload to the `evidence-vault` bucket.

## 5. Next Steps for Planning
- Create `multer` configuration for memory buffering with size limits.
- Implement the Express routes.
- Integrate `@supabase/supabase-js` using the Service Role Key for backend-driven storage.

## RESEARCH COMPLETE
