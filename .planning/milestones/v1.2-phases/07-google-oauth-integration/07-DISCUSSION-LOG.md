# Phase 7: Google OAuth Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-09
**Phase:** 7-Google OAuth Integration
**Areas discussed:** Redirect URL & Callback Handling, OAuth Prompt & Scopes

---

## Redirect URL & Callback Handling

### Question 1: OAuth Redirect Destination
| Option | Description | Selected |
|---|---|---|
| Dynamic `window.location.origin` | Return directly to root URL; Supabase auth listener automatically detects tokens and initializes session | ✓ |
| Dedicated callback path | Route through a specific callback handler path (e.g. `/auth/callback`) | |
| Configurable environment variable | Read redirect URL from `VITE_AUTH_REDIRECT_URL` with origin fallback | |

**User's choice:** Dynamic `window.location.origin`
**Notes:** Native Supabase `onAuthStateChange` listener handles session token resolution automatically without route changes.

### Question 2: Post-OAuth URL Parameters & Hash
| Option | Description | Selected |
|---|---|---|
| Clean URL parameters | Strip tokens/hash from address bar via `history.replaceState` once session is captured | ✓ |
| Leave URL as-is | Allow downstream router/app logic to handle URL state during Phase 8 | |

**User's choice:** Clean URL parameters
**Notes:** Prevents sensitive tokens or dirty URL hashes from staying exposed in the browser address bar.

### Question 3: OAuth Error Detection & Handling
| Option | Description | Selected |
|---|---|---|
| Capture in AuthContext | Parse error/error_description params on mount, expose in context state, and clean URL | ✓ |
| Toast/Banner notification | Show an alert if OAuth fails or is cancelled, keeping context simple | |
| Silent fallback | Log error to console and reset state to unauthenticated without blocking the user | |

**User's choice:** Capture in AuthContext
**Notes:** Context will manage `authError` state so components or future auth forms can display user-friendly feedback.

### Question 4: Callback Loading UX
| Option | Description | Selected |
|---|---|---|
| Glassmorphic Loading Splash | Centered full-screen splash during session token exchange | |
| Minimal inline loader | Display a subtle spinner in the header/auth container without blocking the view | ✓ |
| Instant render | Render interface immediately while auth session resolves in background | |

**User's choice:** Minimal inline loader
**Notes:** Keeps the application feeling snappy and avoids jarring full-page blockers.

---

## OAuth Prompt & Scopes

### Question 1: Account Selection Prompt
| Option | Description | Selected |
|---|---|---|
| Force account selection (`prompt: 'select_account'`) | Always show Google account picker so users can choose or switch accounts easily | ✓ |
| Default Google behavior | Auto-login using active Google session without prompting if only one account exists | |

**User's choice:** Force account selection (`prompt: 'select_account'`)
**Notes:** Enables seamless switching between personal/work accounts and easier testing.

### Question 2: OAuth Scopes & Access Permissions
| Option | Description | Selected |
|---|---|---|
| Standard Identity Scopes (`email profile openid`) | Minimum required permissions for user authentication and avatar/name extraction | ✓ |
| Include Offline Access (`access_type: 'offline'`) | Request offline refresh tokens for persistent external Google API access | |

**User's choice:** Standard Identity Scopes (`email profile openid`)
**Notes:** Strictly follows least privilege principle for authentication.

### Question 3: Sign-in vs Sign-up Action
| Option | Description | Selected |
|---|---|---|
| Unified "Continue with Google" action | Same action creates new accounts or logs in existing accounts transparently | ✓ |
| Differentiated flow tracking | Pass custom state to track whether initiated from login vs registration | |

**User's choice:** Unified "Continue with Google" action
**Notes:** Follows standard OAuth UX best practices.

### Question 4: Domain Restrictions
| Option | Description | Selected |
|---|---|---|
| Any Google account | Allow sign-in with any valid Google account without domain restriction | ✓ |
| Configurable Workspace Domain (`hd`) | Allow restricting sign-in to a specific company domain via an environment variable | |

**User's choice:** Any Google account
**Notes:** Open to all valid Google accounts.

---

## Builder's Discretion
- Extract profile info (full name, avatar URL) from `user_metadata` in Supabase session.
- Expose `signInWithGoogle` helper in `src/services/auth.ts` and in `useAuth()` hook.

## Deferred Ideas
- Polished Glassmorphic Sign In & Sign Up pages deferred to Phase 8.
- Protected Routes & Navigation redirection deferred to Phase 8.
- Extra OAuth providers (GitHub, Apple) deferred to future milestones.
