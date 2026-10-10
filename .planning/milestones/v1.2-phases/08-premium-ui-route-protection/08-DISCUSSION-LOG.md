# Phase 8: Premium UI & Route Protection - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-09
**Phase:** 8-Premium UI & Route Protection
**Areas discussed:** Auth Screen Layout & Visual Style

---

## Auth Screen Layout & Visual Style

### Question 1: Layout Structure
| Option | Description | Selected |
|---|---|---|
| Split-screen Showcase | Left side features security branding, Merkle integrity badges, and live metrics; right side hosts the glassmorphic auth form | |
| Centered Floating Glass Card | Minimalist full-screen ambient dark backdrop with a centered floating glass card and cyan/emerald radial glow | ✓ |
| Modal Overlay with Blur | Render over the application with heavy frosted backdrop-blur, keeping underlying dashboard visible | |

**User's choice:** Centered Floating Glass Card
**Notes:** Clean, focused presentation emphasizing high-security aesthetic without excessive side clutter.

### Question 2: Mode Toggle (Sign In vs Sign Up)
| Option | Description | Selected |
|---|---|---|
| Top Segmented Pill Tabs | A smooth Framer Motion pill slider at the top of the card switching between "Sign In" and "Sign Up" | |
| Bottom Text Link Switcher | Clean cross-fade transition triggered by a "Don't have an account? Register" link at the bottom | ✓ |
| Separate dedicated sub-routes | Distinct views for /login and /signup with a shared wrapper | |

**User's choice:** Bottom Text Link Switcher
**Notes:** Creates a clean, uncluttered card face with intuitive link-based mode switching.

### Question 3: Branding & Header Elements
| Option | Description | Selected |
|---|---|---|
| Shield Logo + Security Badge | Sentinel DMS glowing shield icon, title, subtitle, and an Ed25519/SHA-256 verified security pill | |
| Minimal Logo & Welcome Header | Clean Sentinel DMS brand mark with a refined "Welcome back, Officer" welcome message | ✓ |
| Role-based Agency Header | Display government emblem styling with department jurisdiction indicator | |

**User's choice:** Minimal Logo & Welcome Header
**Notes:** Refined, authoritative, and clean minimalist branding.

### Question 4: Google OAuth Button Placement
| Option | Description | Selected |
|---|---|---|
| Google on Top | Prominent "Continue with Google" button at top, illuminated divider, followed by email/password form | ✓ |
| Google at Bottom | Email and password form primary, with "or continue with Google" button below submit action | |

**User's choice:** Google on Top
**Notes:** Prioritizes frictionless one-click Google OAuth while keeping standard credentials easily accessible.

---

## Builder's Discretion
- Route protection mechanism via state gate in `App.tsx` or `<ProtectedRoute>`.
- Password visibility toggle (eye icon) and interactive validation states.
- Optional guest/demo exploration bypass.

## Deferred Ideas
- MFA / Authenticator TOTP support deferred to future milestones.
- Forgotten password recovery email flow deferred to backlog.
