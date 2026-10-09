---
last_mapped_at: 2026-10-09
---
# Concerns

**Analysis Date:** 2026-10-09

## Tech Debt & Issues
- **Testing:** The codebase currently has no testing infrastructure set up, which can lead to fragile code.
- **Peer Dependencies:** `npm install` requires `--legacy-peer-deps` due to conflicting peer dependencies between `esbuild` and `vite`/`tailwindcss`, which should be properly resolved in the future.

<!-- refreshed: 2026-10-09 -->
