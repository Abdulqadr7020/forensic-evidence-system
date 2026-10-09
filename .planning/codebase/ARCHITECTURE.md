---
last_mapped_at: 2026-10-09
---
# Architecture

**Analysis Date:** 2026-10-09

## System Design
- **Pattern:** SPA (Single Page Application) using React.
- **Entry Point:** `src/main.tsx` bootstrapping `src/App.tsx`.
- **State Management:** Uses React Context (`src/context/`).

## Data Flow
- Data layer abstracted into `src/data/`.
- Views in `src/views/` represent high-level pages (Dashboard, Audit, etc.).
- UI Components are modularized in `src/components/ui/` and layouts in `src/components/layout/`.

<!-- refreshed: 2026-10-09 -->
