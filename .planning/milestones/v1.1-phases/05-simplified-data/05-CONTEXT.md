# Phase 5 Context: Simplified Data Names

**Domain:** Update all mock data (evidence, cases) in the frontend to use short, plain English names instead of technical developer jargon.

## Canonical Refs
*(No external docs exist for this phase.)*

## Decisions
- **Naming Convention**: Use realistic legal/police names (e.g., "Arrest Report - Suspect John Doe.pdf") rather than extremely generic names.
- **IDs**: (Not discussed) Developer discretion to simplify IDs if it helps readability, or keep them as is.

## Code Context
- **Mock Data Location**: `src/data/fixtures.ts` contains the main mock data for cases and documents.
