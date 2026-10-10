# Sentinel DMS

## What This Is
Sentinel DMS is a Document Management System built as a React Single Page Application (SPA). It provides dashboards and views for managing documents, audits, cases, integrity, and transfers.

## Core Value
Providing a premium, modern, and highly polished interface for secure document and case management.

## Current Milestone: v1.3 AES-256-GCM Encryption & Secure Storage

**Goal:** Build a Node.js crypto encryption backend service using `node:crypto` AES-256-GCM to securely encrypt evidence files and sensitive database fields before storing them in Supabase, along with verification and retrieval.

**Target features:**
- Node.js crypto service implementing AES-256-GCM with 12-byte IV and 16-byte authentication tags
- Backend API server handling upload ingestion, encryption, and Supabase persistence
- Encrypted file storage in Supabase Storage with cryptographic hash generation (SHA-256 plaintext/ciphertext)
- Sensitive database field encryption for case dossier and evidence metadata
- Ingestion and creation modal integration with live encryption status and Merkle leaf generation

## Requirements

### Validated
- ✓ Modern React SPA structure — existing
- ✓ Basic routing and views (Dashboard, Audit, Cases, Documents, Integrity, Transfers) — existing
- ✓ Tailwind CSS setup with Lucide-React and Phosphor icons — existing
- ✓ Generative AI integration via `@google/genai` — existing
- ✓ Implement a sleek dark mode with subtle glassmorphism — Phase 1
- ✓ Apply vibrant accent colors to elevate the visual aesthetic — Phase 2
- ✓ Add micro-interactions (animations, hover states, transitions) using `motion` — Phase 3
- ✓ Standardize component consistency (buttons, inputs, modals) across all views — Phase 2
- ✓ Ensure full accessibility and mobile responsiveness — Phase 4
- ✓ Simple plain-language Integrity Verification UI — Quick update
- ✓ Supabase integration for backend authentication — Phase 6
- ✓ Email/Password and Google OAuth sign-in methods — Phase 6 & 7
- ✓ Sleek, glassmorphic Login and Sign-up UI matching the existing theme — Phase 8
- ✓ Route protection (redirecting unauthenticated users to the login page) — Phase 8

### Active
- [ ] Node.js backend API and AES-256-GCM encryption service using inbuilt `node:crypto`
- [ ] Encrypted file upload to Supabase Storage with random IV and authentication tag
- [ ] Field-level encryption for sensitive database columns in Supabase tables
- [ ] Ingest evidence and create case workflows linked to backend encryption service
- [ ] Decrypted download/preview pipeline with integrity verification

### Out of Scope
- [Major backend changes] — Focus is entirely on frontend UI polish and UX improvement.
- [Testing infrastructure] — Currently deferred to prioritize design and component consistency.

## Context
- The codebase uses React 19, Vite, and Tailwind CSS 4.
- UI elements exist and have been upgraded to a premium dark-mode glassmorphism aesthetic.
- The user requested renaming all mock data (evidence and cases) to use simple, short, plain English names instead of complex developer jargon.

## Constraints
- **Tech Stack**: Must use Tailwind CSS for styling and `motion` for animations.
- **Design Aesthetic**: Must strictly adhere to a modern, premium, dark-mode glassmorphic style.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| UI Aesthetic | User selected "Modern & Premium (Sleek dark mode, subtle glassmorphism, vibrant accents)" | — Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-10 after milestone v1.3 initialization*
