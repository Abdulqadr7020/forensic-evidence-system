# Phase 7: Google OAuth Integration - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate Google OAuth provider through Supabase. Ensure a "Sign in with Google" trigger redirects to Google with proper parameters, exchanges the code/session via Supabase, handles errors or cancellations, and manages session state in React. Building the full polished authentication page UI and route guards is out of scope (handled in Phase 8).
</domain>

<decisions>
## Implementation Decisions

### Redirect URL & Callback Handling
- **D-01:** Dynamic `window.location.origin` as the OAuth `redirectTo` target. Supabase client detects session on the landing origin without requiring complex manual router paths prior to Phase 8.
- **D-02:** URL parameter cleanup — Strip token fragments/hashes from the browser address bar via `window.history.replaceState` once Supabase captures the session.
- **D-03:** OAuth error detection — Parse `error` and `error_description` params if the user cancels or Google returns an error on callback, expose an error state in `AuthContext`, and clean up the URL.
- **D-04:** Loading state UX — Display a minimal inline loader/spinner in the auth/header container while the OAuth token exchange resolves, avoiding intrusive full-page blocking before UI Phase 8.

### OAuth Scopes & Prompt Configuration
- **D-05:** Force Google account picker using `queryParams: { prompt: 'select_account' }` so users can choose or switch Google accounts easily.
- **D-06:** Standard identity scopes (`email profile openid`) — request minimal necessary permissions for authentication and user profile data.
- **D-07:** Unified "Continue with Google" action — seamlessly handles both sign-up (creating user) and sign-in (logging in existing user).
- **D-08:** Open domain policy — allow sign-in with any valid Google account without restricting to specific hosted domains (`hd`).

### Builder's Discretion
- **Account Linking & Profile Metadata Extraction:** The builder has discretion to extract standard metadata (`full_name`, `avatar_url`) from `user.user_metadata` in Supabase session and make it readily accessible in state.
- **Service & Context Interface:** The builder has discretion to provide a clean `signInWithGoogle()` function in `src/services/auth.ts` and expose it conveniently in `AuthContext` alongside email auth methods.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Roadmap
- `.planning/ROADMAP.md` §Phase 7 — Defines Phase 7 goal and success criteria.
- `.planning/phases/06-supabase-setup-email-auth/06-CONTEXT.md` — Establishes React Context state management pattern.

### Codebase Auth System
- `src/lib/supabase.ts` — Existing configured Supabase client instance.
- `src/services/auth.ts` — Authentication service functions (`signIn`, `signUp`, `signOut`).
- `src/context/AuthContext.tsx` — Global React context provider listening to `onAuthStateChange`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `supabase` client (`src/lib/supabase.ts`): Supabase client initialized with project credentials from environment variables.
- `AuthProvider` (`src/context/AuthContext.tsx`): React context already listening to `onAuthStateChange` and managing session/user/loading states.

### Established Patterns
- Centralized auth service wrappers in `src/services/auth.ts`.
- React Context hook `useAuth()` providing session state across components without third-party state managers.

### Integration Points
- Add `signInWithGoogle` to `src/services/auth.ts` using `supabase.auth.signInWithOAuth`.
- Extend `src/context/AuthContext.tsx` to handle OAuth error parsing and URL fragment cleanup on mount.

</code_context>

<specifics>
## Specific Ideas
- Clean URL parameters using `window.history.replaceState({}, document.title, window.location.pathname)` immediately upon token capture so sensitive tokens don't remain in browser history.
- Provide a clear, non-blocking inline loader for callback token verification.

</specifics>

<deferred>
## Deferred Ideas
- Glassmorphic Login & Sign-up UI pages — Deferred to Phase 8 (Premium UI & Route Protection).
- Route protection guards for dashboard — Deferred to Phase 8.
- Additional OAuth providers (GitHub, Microsoft, Apple) — Backlog / future consideration.

</deferred>

---

*Phase: 07-Google OAuth Integration*
*Context gathered: 2026-10-09*
