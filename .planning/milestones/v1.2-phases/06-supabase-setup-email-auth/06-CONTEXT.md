# Phase 6 Context: Supabase Setup & Email Auth

**Domain:** Initialize the Supabase project connection and implement basic email/password sign up and login logic.

## Canonical Refs
*(No external ADRs or Specs referenced)*

## Prior Decisions
- **From Milestone 1.2 Roadmap**: Supabase is the chosen backend authentication provider.
- **Project constraints**: UI must be modern, premium, dark-mode, and glassmorphic.

## Implementation Decisions

### Auth State Management
- **Decision:** React Context
- **Details:** We will implement an `AuthProvider` that wraps the application (or specific routes) to provide authentication state to components natively without requiring extra dependencies.

### Email Flow Type
- **Decision:** Standard Email & Password
- **Details:** We will stick to the roadmap scope and implement standard password-based authentication, avoiding magic links for now.
