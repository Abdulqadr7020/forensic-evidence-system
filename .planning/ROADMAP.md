# Roadmap (Milestone v1.2)

## Phase 6: Supabase Setup & Email Auth
**Goal:** Initialize the Supabase project connection and implement basic email/password sign up and login logic.
**Requirements:** 
- AUTH-01: Email/Password Auth

**Success Criteria:**
1. Supabase client is configured and can connect to the project.
2. Users can create a new account using an email and password.
3. Users can log in with their created email and password.

## Phase 7: Google OAuth Integration
**Goal:** Integrate Google OAuth provider through Supabase.
**Requirements:** 
- AUTH-02: Google OAuth

**Success Criteria:**
1. A "Sign in with Google" action successfully redirects to Google for authentication.
2. Upon successful Google authentication, the user session is established in the app.

## Phase 8: Premium UI & Route Protection
**Goal:** Build the sleek, glassmorphic authentication UI pages and protect the main application routes.
**Requirements:** 
- AUTH-03: Route protection
- UI-01: Glassmorphic UI

**Success Criteria:**
1. The Login and Sign-up pages perfectly match the dark-mode glassmorphic aesthetic of the app.
2. Unauthenticated users attempting to access the dashboard or other views are redirected to the Login page.
3. Authenticated users are correctly redirected to the dashboard.
