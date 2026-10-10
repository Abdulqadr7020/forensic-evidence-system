# Stack Research

**Domain:** Cryptographic Storage & Backend Security Service for Forensic DMS  
**Researched:** 2026-10-10  
**Confidence:** HIGH  

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `node:crypto` | Inbuilt (Node.js 20+) | AES-256-GCM authenticated encryption, SHA-256 hashing, CSPRNG IV generation | Inbuilt, zero-dependency, OpenSSL/hardware-accelerated (AES-NI), constant-time operations, native GCM authentication tags. |
| `express` | ^4.21.2 | Dedicated backend API server and multipart ingestion endpoints | Already in project dependencies; lightweight, well-tested middleware pipeline for handling binary file uploads and cryptographic streams. |
| `@supabase/supabase-js` | ^2.117.3 | Secure storage upload to Supabase Storage and database table persistence | Official Supabase client with support for Storage buckets, RLS authentication, and service-role bypass for backend encryption workers. |
| `multer` | ^1.4.5-lts.1 | Multipart/form-data handler for evidence document uploads | Industry standard for Express buffer/disk file ingestion without memory leaks. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | ^17.2.3 | Environment variable loading for server encryption keys | Loading `ENCRYPTION_KEY` and Supabase service credentials securely on the server. |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing middleware | Enabling seamless communication between Vite frontend (port 3000) and backend encryption API (port 3001) or Vite proxy. |
| `tsx` | ^4.21.0 | TypeScript execution runtime for Node.js server | Already in project devDependencies; instant execution of TypeScript backend files with ESM support. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `tsx` | Run backend API in dev mode | `npx tsx server/index.ts` with instant reload. |
| `tsc` | Type checking for backend crypto contracts | Integrated with project's existing `npm run lint`. |

## Installation

```bash
# Core & Supporting dependencies (express, dotenv, @supabase/supabase-js already installed)
npm install multer cors

# Dev dependencies
npm install -D @types/multer @types/cors
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `node:crypto` (AES-256-GCM) | `crypto-js` | NEVER in Node.js backend. `crypto-js` is an unmaintained, slow pure-JS library lacking native hardware acceleration and proper GCM streaming tags. |
| AES-256-GCM (Authenticated) | AES-256-CBC with HMAC | CBC requires separate HMAC key derivation (Encrypt-then-MAC) and is vulnerable to padding oracle attacks if implemented incorrectly. GCM provides AEAD (Authenticated Encryption with Associated Data) in a single primitive. |
| Express API + Vite Proxy | Browser Web Crypto API only | Web Crypto API exposes secret keys in client memory and browser inspect tools. Backend Node.js service protects the master vault key from user tampering. |

## What NOT to Use

- **`crypto-js`**: Outdated, slow, improper GCM support, exposes secrets.
- **AES-ECB mode**: Insecure pattern leak, fails basic forensic compliance.
- **Static IVs / Nonces**: Catastrophic failure in GCM mode; reusing an IV with the same key breaks confidentiality and authenticity.
- **Client-side Master Key Injection**: Never expose `ENCRYPTION_KEY` in `VITE_` frontend client env vars.
