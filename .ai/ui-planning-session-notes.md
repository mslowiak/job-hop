<conversation_summary>

<decisions>
1. View hierarchy organized with top-level /dashboard for listing applications (GET /api/applications), detail routes /applications/:id for individual views (GET /api/applications/{id}), and /stats for statistics (GET /api/applications/stats), aligning navigation with API resources.
2. Core user flows include registration/login redirecting to dashboard, application form submission (POST /api/applications) redirecting to updated dashboard list, and quick status updates (PATCH /api/applications/{id}) without page reloads using React components.
3. Persistent navigation bar with links to /dashboard, /stats, and dynamic links to /applications/:id, including prefetching on hover or route changes for optimized API calls.
4. Use Shadcn/ui components (forms, modals, dropdowns) for CRUD operations, integrated with React hooks (e.g., useMutation for POST/PATCH), including loading states and optimistic updates.
5. Tailwind responsive utilities for mobile-first design, with collapsible navigation on small screens and infinite scrolling (React Query useInfiniteQuery) or load-more buttons for paginated lists (page/limit params in /api/applications).
6. WCAG compliance via semantic HTML, ARIA labels on interactive elements (e.g., status dropdowns, links), keyboard navigation, screen reader-friendly empty states, and focus trapping/management in modals (e.g., delete confirmation with role="dialog").
7. Defer JWT token implementation and add no authentication mechanisms for the current MVP stage.
8. Consistent design system using Shadcn/ui customizable components, neutral color palette, clear typography for Polish text, intuitive icons for status changes, and feedback toasts for API states.
9. No live polling; rely on manual page refreshes for updates, with refetch of /api/applications/stats on mount or route activation.
10. Client-side validation for forms using React Hook Form with Zod schemas matching API requirements, providing inline Polish error messages (e.g., "Nazwa firmy jest wymagana").
11. Profile menu structured as Shadcn/ui DropdownMenu with "Ustawienia Konta" (modal/inline form) and "Wyloguj", collapsing to hamburger menu on mobile.
12. Optimistic updates for status changes reflected immediately in local state, with reversion and toast on error, followed by refetch for consistency.
13. Polish-only for MVP, with strings extracted to a constants file for future i18n preparation (e.g., react-i18next).
14. Empty state on dashboard designed with illustration/icon, Polish text (e.g., "Nie masz jeszcze żadnych aplikacji. Dodaj pierwszą!"), and CTA button to add form, integrated with Tailwind responsive layout.
15. Network errors handled per-component with Shadcn/ui toasts (e.g., "Błąd sieci. Spróbuj ponownie.") and retry buttons re-triggering mutations, logging to console.
</decisions>

<matched_recommendations>
1. Organize view hierarchy to align with API for efficient data loading, using routes like /dashboard, /applications/:id, and /stats.
2. Implement user flows with redirects and seamless updates via React for core operations like adding applications and status changes.
3. Persistent navigation bar with prefetching to optimize API interactions across views.
4. Shadcn/ui components with React hooks for CRUD, including loading and optimistic updates to enhance responsiveness.
5. Mobile-first Tailwind design with collapsible nav and pagination handling via infinite scrolling or load-more.
6. Accessibility features like ARIA, semantic HTML, keyboard support, and focus management in modals for WCAG compliance.
7. Consistent design with neutral palette, Polish text support, icons, and toasts for UX feedback.
8. Lightweight state management with refetch on mount/activation, avoiding polling for manual refresh approach.
9. Client-side validation with Zod and Polish errors to complement API validation and improve form UX.
10. Per-component error handling with user-friendly toasts, retries, and logging for API exceptions like 400/404/5xx.
11. Empty state design integrated responsively, guiding users to first action.
12. Profile menu responsive structure for account actions without dedicated routes.
13. Optimistic updates with error reversion and refetch to maintain data sync.
14. String extraction for future i18n while keeping MVP Polish-only.
</matched_recommendations>

<ui_architecture_planning_summary>
### a. Main UI Architecture Requirements
The UI architecture for JobHop MVP emphasizes simplicity, transparency, and full responsiveness (RWD) using Astro 5 for static pages, React 19 for interactive components, TypeScript 5 for type safety, Tailwind 4 for styling, and Shadcn/ui for accessible, customizable UI elements. No authentication is implemented at this stage, deferring JWT and Supabase auth integration. The design focuses on Polish text with constants extraction for potential future i18n, neutral color palette, clear typography, intuitive icons, and feedback toasts. Error handling prioritizes user-friendly messages in Polish, with per-component retries and console logging. Pagination uses API params (page/limit) with infinite scrolling on mobile and load-more on desktop via React Query.

### b. Key Views, Screens, and User Flows
- **Views/Screens**: 
  - Dashboard (/dashboard): Main post-login view listing applications (GET /api/applications), sorted by created_at DESC, with filtering by status, empty state (Polish CTA to add first application), and quick status dropdowns.
  - Application Details (/applications/:id): Detailed view (GET /api/applications/{id}) showing all fields (company_name, position_name, etc.), with edit and delete buttons (PATCH/DELETE via modals).
  - Stats (/stats): Simple textual list of application counts by status (GET /api/applications/stats), refetched on mount.
  - Forms: Dedicated add/edit forms for applications (POST/PATCH /api/applications) with required fields validation.
  - Navigation: Persistent header with links to dashboard/stats, profile dropdown (settings/logout), collapsible hamburger on mobile.
- **User Flows**:
  - Onboarding: (Deferred auth) Direct to dashboard; empty state prompts adding first application.
  - Add Application: Button from dashboard to form; submit redirects to updated dashboard list with optimistic placement.
  - Manage Applications: List view with click-to-details, quick status updates (optimistic, no reload), filter by status, pagination scrolling.
  - Edit/Delete: From details view, inline editing or modals with confirmation and focus trapping.
  - Stats Navigation: From nav bar, loads fresh counts; manual refresh for updates.
  - Profile: Dropdown for settings (modal form) and logout.

### c. API Integration and State Management Strategy
API integration uses Supabase backend endpoints for applications CRUD and stats, with React hooks (useMutation for mutations, useInfiniteQuery for lists, useQuery for details/stats) via React Query for caching and refetching (on mount, error recovery, route changes). Client-side Zod validation matches API schemas for forms (required: company_name, position_name, application_date; optional: link, notes, status default 'sent'). Optimistic updates for status changes (immediate local reflect, revert/refetch on error). No polling; manual page refreshes handle sync. State managed lightly with React context or Zustand for global items (e.g., lists), focusing on API-driven data flows without complex stores.

### d. Responsiveness, Accessibility, and Security Considerations
- **Responsiveness**: Mobile-first Tailwind classes; collapsible nav/hamburger on small screens; infinite scrolling for touch UX, load-more buttons on desktop; forms and lists adapt to viewport.
- **Accessibility**: WCAG-compliant with semantic HTML, ARIA labels (e.g., on dropdowns/links), keyboard navigation/focus trapping in modals (role="dialog", return focus on close), screen reader support for empty states and errors.
- **Security**: No auth implementation now (deferred JWT/Supabase); future plans include token-based route protection and 401 redirects. API calls scoped to user via backend RLS, but UI assumes open access for MVP.

</ui_architecture_planning_summary>
</conversation_summary>