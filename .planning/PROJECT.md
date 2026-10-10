# Sentinel DMS

## What This Is
Sentinel DMS is a Document Management System built as a React Single Page Application (SPA). It provides dashboards and views for managing documents, audits, cases, integrity, and transfers.

## Core Value
Providing a premium, modern, and highly polished interface for secure document and case management.

## Current Milestone: v1.2 Authentication & Authorization

**Goal:** Implement a secure authentication system using Supabase with a premium UI.

**Target features:**
- Supabase integration for backend authentication
- Email/Password and Google OAuth sign-in methods
- Sleek, glassmorphic Login and Sign-up UI matching the existing theme
- Route protection (redirecting unauthenticated users to the login page)

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

### Active
- [ ] Rename all evidence file names in mock data to plain English
- [ ] Rename all case names and IDs to be short and descriptive
- [ ] Update any terminology to be easily understandable by non-technical users
- [ ] Supabase integration for backend authentication
- [ ] Email/Password and Google OAuth sign-in methods
- [ ] Sleek, glassmorphic Login and Sign-up UI matching the existing theme
- [ ] Route protection (redirecting unauthenticated users to the login page)

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
*Last updated: 2026-10-09 after milestone v1.2 initialization*
