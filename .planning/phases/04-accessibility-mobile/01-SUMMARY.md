# Phase 4 Summary: Accessibility & Mobile Optimization

## What was built
- **Global Focus Utility:** Created a `.focus-glow` class in `index.css` using Tailwind's arbitrary values for `box-shadow` (`inset 0 0 0 1.5px var(--focus-ring), inset 0 0 12px rgba(139,92,246,0.3)`). This provides a cyberpunk-themed inner glow on focus.
- **Component Updates:** Applied `.focus-glow` to `Button.tsx`, `Badge.tsx`, `CaseFolderCard.tsx`, `EvidenceFolderCard.tsx`, and `Header.tsx`/`MobileNav.tsx` interactive buttons.
- **Card Accessibility:** Ensured `MetricCard` acts as a focusable button when it has an `onClick` prop by assigning `tabIndex={0}` and `role="button"` along with `.focus-glow`.
- **Contrast Ratios:** Boosted `--text-secondary` (to `#B0B0B8`) and `--text-muted` (to `#82828C`) in dark mode to guarantee they meet WCAG AA contrast standards against glassmorphic backgrounds.

## Verification
- Linting and build passed cleanly.
- `index.css` successfully hosts the new custom utilities and base token adjustments.
- All primary interactive elements now sport an accessible, visually integrated inner focus glow.

## Learnings
- Using a custom `@layer utilities` class (`.focus-glow`) makes it significantly easier to enforce a custom `box-shadow` focus effect globally across arbitrary components, avoiding cluttered tailwind utility strings on each component.
