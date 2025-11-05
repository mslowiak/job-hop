# Authentication Architecture Specification for JobHop

## Overview
This specification outlines the architecture for implementing user registration, login, and account management (password change and account deletion) in the JobHop application, as per PRD section 3.1 and aligned with user stories US-001 (Registration) and US-002 (Login). The design leverages the project's tech stack: Astro 5 for static and server-side rendering (SSR), React 19 for interactive components, TypeScript 5 for type safety, Tailwind 4 for styling, and Shadcn/ui for reusable UI elements. Backend authentication is handled via Supabase Auth, providing PostgreSQL-based user management, JWT token issuance, and secure session handling.

Password recovery (e.g., &quot;Forgot Password&quot; flow) is mentioned in the development focus but explicitly excluded from the MVP scope per PRD section 4 (Boundaries). It is designed as a future extension, with placeholders in the architecture to ensure seamless integration without disrupting current behavior. The implementation ensures compatibility with existing requirements, such as dashboard access post-login, session persistence, and error handling across auth and non-auth states. No breaking changes are introduced to non-auth flows (e.g., public landing page) or future features (e.g., CRUD operations on job applications).

Key principles:
- **Security**: All auth operations use HTTPS; sensitive data (e.g., passwords) is never logged or exposed client-side.
- **Performance**: Client-side auth for interactivity; SSR for initial page loads to protect routes.
- **Accessibility**: Forms comply with WCAG standards using Shadcn/ui components.
- **Error Handling**: Consistent user-friendly messages; server-side validation prevents invalid states.
- **Type Safety**: All contracts use TypeScript interfaces for requests/responses.

## 1. User Interface Architecture

### Frontend Layer Changes
The frontend will introduce dedicated auth pages while extending existing layouts and navigation for authenticated states. Auth flows operate in a &quot;guest mode&quot; (non-auth) for public access and &quot;user mode&quot; (auth) for protected routes. No changes to public assets or static components outside auth contexts.

- **New Pages**:
  - `/pages/register.astro`: Astro page for user registration. Renders a React-based form component for interactivity. Handles SSR for initial load (e.g., SEO-friendly title: &quot;Register for JobHop&quot;). On successful registration, redirects to `/dashboard` via client-side navigation.
  - `/pages/login.astro`: Astro page for user login. Similar structure to registration, rendering a React form. Redirects to `/dashboard` on success or `/register` if user is unregistered.
  - **Future Extension**: `/pages/forgot-password.astro` (placeholder page, not implemented in MVP). Would render a simple email input form for password reset initiation, integrating with Supabase&#39;s `resetPasswordForEmail` method.

- **Extended/Modified Pages and Layouts**:
  - `/layouts/MainLayout.astro` (existing, extended): 
    - **Non-Auth Mode**: Displays guest navigation (e.g., links to Login/Register). No user menu.
    - **Auth Mode**: Shows authenticated navigation with links to Dashboard (`/`), Stats (`/stats`), and user profile dropdown (Settings, Logout). Uses Supabase SSR to check session on load; redirects unauthenticated users to `/login`.
    - Integration: Wraps all protected pages (e.g., `/pages/dashboard.astro`, `/pages/stats.astro`). Adds a global `&lt;AuthProvider&gt;` React context (see below) for session state.
  - `/pages/index.astro` (landing/public page, unchanged but extended): If unauthenticated, shows CTA buttons linking to `/register` or `/login`. If authenticated, redirects to `/dashboard`.
  - `/pages/dashboard.astro` (existing, extended): Protected route. Uses SSR to verify session; renders empty state or application list only for authenticated users.
  - **Future Extension**: Account settings page (`/pages/account.astro`): Accessible via the user profile dropdown in the navigation. Extends MainLayout and renders React-based forms using Shadcn/ui for changing password (old + new) and deleting account (with password confirmation). Integrates with `/api/auth/change-password.ts` and `/api/auth/delete-account.ts` endpoints. Protected route with SSR session check; on successful deletion, redirects to login page with success message.

- **New Components**:
  - `/components/auth/AuthForm.tsx` (React): Reusable form wrapper using React Hook Form for validation and Shadcn/ui for inputs (e.g., `Input`, `Button`, `Label`). Variants for register/login. Props: `mode: &#39;register&#39; | &#39;login&#39;`, `onSubmit: (data: AuthData) =&gt; Promise&lt;void&gt;`.
  - `/components/auth/AuthProvider.tsx` (React Context): Manages global auth state (e.g., `user`, `session`, `loading`). Integrates Supabase client for real-time session tracking. Placed at app root in `MainLayout.astro` via `&lt;ClientOnly&gt;`.
  - `/components/ui/FeedbackMessage.tsx` (Shadcn/ui extension): Displays success/error toasts using `react-hot-toast` or Shadcn&#39;s `Toast` component. Variants for auth errors (e.g., &quot;Invalid email or password&quot;).
  - **Future Extension**: `/components/auth/PasswordResetForm.tsx` (React) for recovery flow, with email input and success message linking to check inbox.

- **Precise Separation of Responsibilities**:
  - **Astro Pages**: Handle routing, SSR (e.g., session checks via Supabase SSR helpers), and static rendering. Integrate React components via `&lt;MyComponent client:load /&gt;` for hydration. Responsible for layout wrapping and redirects (e.g., using `Astro.redirect()` in SSR).
  - **React Components**: Manage interactive logic (form submission, validation, loading states). AuthForm handles client-side API calls to Supabase (e.g., `supabase.auth.signUp()`). AuthProvider centralizes session queries/updates, providing hooks like `useAuth()` for child components (e.g., dashboard fetches user-specific data).
  - **Integration with Backend/Navigation/User Actions**:
    - Forms submit to Supabase Auth directly (client-side) for low latency; no custom API proxy needed for core auth.
    - Navigation: Use `next/router` or Astro&#39;s client-side routing with `createClient` from Supabase for session-aware redirects (e.g., after login, update URL and re-fetch protected data).
    - User Actions: Logout triggers `supabase.auth.signOut()`, clears context, and redirects to `/`. Protected actions (e.g., add application) check `useAuth().user` before proceeding.

### Validation Cases and Error Messages
- **Client-Side Validation** (React Hook Form + Zod schemas):
  - Email: Required, valid format (`z.string().email()`). Error: &quot;Please enter a valid email address.&quot;
  - Password: Required, min 8 chars (`z.string().min(8)`). Error: &quot;Password must be at least 8 characters.&quot;
  - Confirm Password (Register only): Matches password (`z.string().refine((val, ctx) =&gt; val === ctx.root.password)`). Error: &quot;Passwords do not match.&quot;
  - Real-time feedback via Shadcn/ui input states (e.g., error variant on invalid).

- **Server-Side Validation** (Supabase): Enforced automatically (e.g., unique email). Client catches errors via try-catch on API calls.

- **Error Messages** (User-Friendly, Localized to English/Polish if extended):
  - Registration: &quot;Email already exists&quot; (Supabase `AuthErrorCode.UserAlreadyRegistered`).
  - Login: &quot;Invalid email or password&quot; (generic for security; Supabase `AuthErrorCode.InvalidLoginCredentials`).
  - Network/Generic: &quot;Something went wrong. Please try again.&quot; with retry button.
  - Success: Toast &quot;Account created successfully!&quot; or &quot;Logged in successfully.&quot;

### Handling of Key Scenarios
- **Successful Registration**: Form submit → Supabase signUp → Auto-login (Supabase default) → Set session in AuthProvider → Redirect to `/dashboard` → Show welcome empty state.
- **Failed Registration**: Validation error → Highlight fields + message. Server error → Toast + log to console (not production logs).
- **Successful Login**: Submit → signInWithPassword → Update session → Redirect to `/dashboard`.
- **Failed Login**: Invalid creds → Generic error toast. Locked account (future) → &quot;Too many attempts; try later.&quot;
- **Session Expiration**: AuthProvider listens to Supabase events; redirects to `/login` on auth state change.
- **Protected Route Access (Unauth)**: SSR in MainLayout checks `getSession()`; redirects to `/login` with return URL param (e.g., `/login?redirect=/dashboard`).
- **Future Password Recovery**: Email submit → Supabase `resetPasswordForEmail` → Toast &quot;Check your email for reset link.&quot; → Redirect to `/login`. Link handles via Supabase callback.

## 2. Backend Logic

### Structure of API Endpoints and Data Models
Supabase Auth manages core user data; no custom tables needed for MVP auth. Extensions for job applications (e.g., `applications` table) will reference `auth.users.id` via RLS (Row Level Security) policies.

- **Data Models** (Supabase Schema):
  - `auth.users` (Built-in): Fields: `id` (UUID, PK), `email` (string, unique), `encrypted_password` (string), `created_at` (timestamp), `updated_at` (timestamp), `last_sign_in_at` (timestamp). JWT claims include `sub` (user ID), `email`.
  - **Future**: Custom `profiles` table (public schema): `id` (UUID, FK to auth.users), `full_name` (string, optional for extensions).
  - Job Applications (Existing/Planned): `applications` table with `user_id` (UUID, FK to auth.users.id), ensuring ownership via RLS: `auth.uid() = user_id`.

- **API Endpoints** (Minimal, Client-Driven):
  - No custom `/api/auth/*` endpoints for core flows; use Supabase SDK directly (e.g., `supabase.auth.signUp({email, password})`).
  - **Protected Endpoints** (Future, for CRUD): `/api/applications` (POST/GET/PUT/DELETE) – Use Supabase client in Astro API routes (`/pages/api/applications.ts`) with `createServerClient` for RLS enforcement.
  - **Auth-Related Endpoints** (Astro API Routes):
    - `/api/auth/logout.ts`: Server-side `supabase.auth.signOut()` + clear cookies. Returns `{ success: true }`.
    - `/api/auth/change-password.ts`: Server-side API that first verifies the old password by attempting `supabase.auth.signInWithPassword({ email: user.email, password: oldPassword })` using the anon key client. If verification succeeds, uses the admin client (service key) to call `admin.auth.updateUserById(userId, { password: newPassword })`. If verification fails, returns 401 error "Invalid old password". Input: `{ oldPassword, newPassword }`. Ensures password strength validation with Zod.
    - `/api/auth/delete-account.ts`: Server-side API that first verifies the provided password by attempting `supabase.auth.signInWithPassword({ email: user.email, password: providedPassword })`. If successful, uses admin client to `admin.auth.deleteUser(userId)`, deletes all related data from `applications` table with `supabase.from('applications').delete().eq('user_id', userId)` (bypassing RLS with service key), and optionally from `profiles`. Then calls `supabase.auth.signOut()` for the current session. Returns success or 401 on invalid password.

- **Input Data Validation Mechanism**:
  - Client: Zod schemas in React forms (e.g., `AuthSchema: z.object({ email: z.string().email(), password: z.string().min(8) })`).
  - Server: Supabase enforces (e.g., email uniqueness, password hashing with Argon2). Custom validators in API routes use Zod for body parsing (e.g., `req.json()` → `AuthSchema.parse(body)`). Reject invalid inputs with 400 status + JSON error.

### Exception Handling
- **Client-Side**: Try-catch around Supabase calls; map errors to user messages (e.g., `if (error.code === &#39;P2002&#39;) { toast(&#39;Email taken&#39;) }`). Fallback: Generic error + retry.
- **Server-Side**: In API routes, use try-catch; return HTTP 4xx/5xx with `{ error: &#39;Message&#39; }`. Log exceptions to Supabase logs (via `console.error`). RLS violations auto-return 403.
- **Global**: AuthProvider handles Supabase `onAuthStateChange` for real-time errors (e.g., token expiry → auto-logout).
- **Edge Cases**: Rate limiting (Supabase built-in), email confirmation (optional, disable for MVP), concurrent logins (Supabase handles session revocation).

### Update of Server-Side Rendering Method
- **Astro Config Integration** (`astro.config.mjs`): Enable SSR mode if not already (`output: &#39;server&#39;` or hybrid). Add Supabase middleware via `integrations: [supabase()]` (using `@supabase/astro` package if available; otherwise manual).
- **SSR Implementation**:
  - Use `@supabase/ssr` package: Create `createServerClient` in `_astro.js` or utils (`lib/supabase.ts`).
  - In protected pages/layouts: `const { data: { session } } = await supabase.auth.getSession(); if (!session) return Astro.redirect(&#39;/login&#39;);`.
  - Cookies: Set `SUPABASE_AUTH_TOKEN` via `response.cookies.set()` on login; parse on requests.
  - Hydration: Pass SSR session to client via props in React components (e.g., `&lt;AuthProvider initialSession={session} client:load /&gt;`).
  - Compatibility: No impact on static pages; hybrid mode allows auth pages to SSR while keeping public static.

## 3. Authentication System

### Use of Supabase Auth with Astro
Supabase Auth provides a complete BaaS solution for registration, login, logout, and future recovery, integrated seamlessly with Astro&#39;s hybrid rendering.

- **Core Modules and Services**:
  - **Supabase Client Setup** (`lib/supabase.ts`):
    - Client-Side: `createClient(supabaseUrl, supabaseAnonKey)` for browser auth.
    - Server-Side: `createServerClient(supabaseUrl, supabaseServiceKey, cookieOptions)` for SSR/API.
    - Admin Client: `const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)` for privileged operations like updating user passwords and deleting users/accounts in API routes. This client bypasses RLS and uses admin privileges.
  - **Registration Service** (`services/auth.ts`