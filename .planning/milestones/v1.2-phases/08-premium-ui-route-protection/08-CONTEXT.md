# Phase 8: Premium UI & Route Protection - Context

**Gathered:** 2026-10-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the sleek, glassmorphic authentication UI pages (Sign In & Sign Up) matching Sentinel DMS's dark-mode aesthetic, and protect application views so unauthenticated users cannot access restricted dashboards without logging in.
</domain>

<decisions>
## Implementation Decisions

### Auth Screen Layout & Visual Style
- **D-01:** Centered Floating Glass Card — Minimalist full-screen ambient dark backdrop with a centered floating glass card, subtle border illumination, backdrop blur (`backdrop-blur-xl`), and radial cyan/emerald glow.
- **D-02:** Bottom Text Link Switcher — Smooth cross-fade transition inside the card triggered by a bottom link ("Don't have an account? Create account" / "Already have an account? Sign in").
- **D-03:** Minimal Logo & Welcome Header — Refined Sentinel DMS brand mark with shield icon and welcome heading ("Welcome back, Officer").
- **D-04:** Google on Top — Prominent "Continue with Google" button positioned at the top of the card, followed by an illuminated "or continue with credentials" divider and email/password form fields.

### Builder's Discretion
- **Route Protection Mechanism:** Gate main application views using a clean protection wrapper or state gate in `App.tsx`. While session `loading` is true, render a minimal inline/splash indicator. If unauthenticated, display the Auth page. Upon successful sign in or Google callback, redirect to dashboard.
- **Form Ergonomics:** Password visibility toggle (eye icon), clear loading states on buttons (`Loader2`), error message displays linked to `authError`, and validation checks.
- **Demo / Guest Exploration:** Include an optional "Continue as Guest / Demo" option for quick review and testing of existing role portals without blocking behind credentials.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Roadmap
- `.planning/ROADMAP.md` §Phase 8 — Requirements AUTH-03 and UI-01, success criteria.
- `.planning/phases/06-supabase-setup-email-auth/06-CONTEXT.md` — Email auth context and Supabase client setup.
- `.planning/phases/07-google-oauth-integration/07-CONTEXT.md` — Google OAuth decisions and callback patterns.

### Codebase Auth System
- `src/context/AuthContext.tsx` — Global auth provider with `session`, `user`, `isAuthenticated`, `signInWithGoogle`, `signOut`.
- `src/services/auth.ts` — Authentication methods (`signUp`, `signIn`, `signOut`, `signInWithGoogle`).
- `src/App.tsx` — Root application shell and view router.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component (`src/components/ui/Button.tsx`): Primary, secondary, outline, and glass variants with motion effects.
- `AppShell` (`src/components/layout/AppShell.tsx`): Main dashboard wrapper with navigation and header.
- `useAuth` hook (`src/context/AuthContext.tsx`): Access to current authentication status and methods.
- Phosphor icons & Lucide icons for icons (`Shield`, `Eye`, `EyeOff`, `Lock`, `Mail`, `ArrowRight`).

### Established Patterns
- Glassmorphic styling with `bg-[var(--surface-elevated)]`, `backdrop-blur-md`, `border-[var(--border)]`.
- Framer Motion `AnimatePresence` and `motion.div` for page and form state transitions.

### Integration Points
- Create `src/views/AuthView.tsx` with centered glass card, Google button, and email/password inputs.
- Update `src/App.tsx` to conditionally gate `AppContent` behind `isAuthenticated` check with smooth transition.

</code_context>

<specifics>
## Specific Ideas
- Clean, focused card width (approx `max-w-md` or `w-full max-w-sm sm:max-w-md`).
- Subtle ambient background glows (`radial-gradient`) in the center to highlight the floating card.
- Smooth Framer Motion transitions when toggling between Sign In and Sign Up modes.

</specifics>

<deferred>
## Deferred Ideas
- Multi-factor authentication (MFA / TOTP) — Deferred to future milestones.
- Password reset / recovery email flows — Backlog.
- Role invitation emails and SSO SAML enterprise connections — Backlog.

</deferred>

---

*Phase: 08-Premium UI & Route Protection*
*Context gathered: 2026-10-09*
