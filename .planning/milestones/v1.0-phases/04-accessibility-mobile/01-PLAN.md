# Phase 4 Plan: Accessibility & Mobile Optimization

## Goal
Optimize the application for mobile viewports and enhance keyboard accessibility by replacing the default offset focus ring with a custom inner glow that matches the cyberpunk aesthetic.

## Task 1: Focus Utilities & Color Contrast
- **File:** `src/index.css`
- **Action:** 
  1. Add a `@layer utilities` block containing a new `.focus-glow` class.
  2. Implement `.focus-glow` using `outline-none focus-visible:ring-0 focus-visible:shadow-[inset_0_0_0_1.5px_var(--focus-ring),inset_0_0_8px_var(--focus-ring)]` to create the desired inner glow effect.
  3. Ensure `--text-muted` and `--text-secondary` provide sufficient contrast (at least 4.5:1 WCAG AA) against glassmorphism surface backgrounds.

## Task 2: Standardize Component Focus States
- **Files:** `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`
- **Action:** Replace existing Tailwind focus ring utilities (e.g., `focus-visible:ring-2 focus-visible:ring-offset-1`) with the new `.focus-glow` class.
- **Action:** Ensure standard HTML semantics and ARIA labels are maintained for screen readers.

## Task 3: Interactive Card Accessibility
- **Files:** `src/components/ui/MetricCard.tsx`, `src/components/ui/CaseFolderCard.tsx`, `src/components/ui/EvidenceFolderCard.tsx`
- **Action:** Add `tabIndex={0}` and the `.focus-glow` class to these interactive cards so they can be navigated and activated via keyboard. Add `onKeyDown` handlers if they trigger actions like `onClick`.

## Acceptance Criteria
- `index.css` contains the `.focus-glow` utility.
- `Button.tsx` and interactive cards use `.focus-glow`.
- Interactive cards can receive keyboard focus (`tabIndex={0}`).

## Verification Command
```bash
grep "focus-glow" src/index.css src/components/ui/Button.tsx
```
