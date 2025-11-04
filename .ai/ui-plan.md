# UI Architecture for JobHop

## 1. UI Structure Overview

The UI architecture for JobHop is designed as a single-page application (SPA)-like experience built with Astro and React components, emphasizing simplicity, transparency, and responsiveness. It centers around a dashboard for application management, a details view for individual applications, a statistics page for insights, and supporting elements like forms and modals for CRUD operations. Navigation is handled via a persistent header with links to main sections and a user profile menu. The structure aligns with the API endpoints for seamless data integration, focusing on user flows for adding, viewing, editing, and tracking job applications. Accessibility is ensured through semantic elements and ARIA attributes, while security considerations defer authentication enforcement for the MVP but plan for token-based protection. The design addresses user pain points like fragmented tracking by providing a centralized, filterable list and quick status updates.

## 2. View List

### Dashboard View
- **View Path**: `/dashboard`
- **Main Purpose**: Serve as the primary landing page after login, displaying a list of all user applications for easy management and overview.
- **Key Information to Display**: List of applications with columns for company name, position name, and status dropdown; filter by status; empty state if no applications; add application button.
- **Key View Components**: Application list table, status filter dropdown, add button, empty state illustration with CTA.
- **UX, Accessibility, and Security Considerations**: Responsive table for mobile/desktop; keyboard-navigable list and filters (ARIA labels for dropdowns); optimistic updates for status changes; future auth guard to prevent unauthorized access.

### Application Details View
- **View Path**: `/applications/:id`
- **Main Purpose**: Provide a detailed view of a single application, allowing users to review all information and perform edits or deletions.
- **Key Information to Display**: All application fields (company name, position name, application date, link, notes, status); edit and delete buttons.
- **Key View Components**: Detail form layout, editable fields in edit mode, confirmation modal for delete.
- **UX, Accessibility, and Security Considerations**: Inline editing for quick changes; focus management in modals (role="dialog"); ensure link fields are clickable and secure (no sensitive data exposure); validate user ownership via API.

### Statistics View
- **View Path**: `/stats`
- **Main Purpose**: Display a summary of applications by status to help users assess their job search progress.
- **Key Information to Display**: Textual list of counts per status (e.g., "Sent: 5"); total applications count.
- **Key View Components**: Stats grid, refresh indicator.
- **UX, Accessibility, and Security Considerations**: Simple, scannable layout with large numbers; screen reader-friendly labels; real-time updates on navigation; scoped to user data via API.

### Add/Edit Application Form View
- **View Path**: `/applications/new` (for add); inline or modal in details for edit
- **Main Purpose**: Enable creation or modification of application entries with form validation.
- **Key Information to Display**: Form fields for required (company name, position name, application date, status) and optional (link, notes) data; validation errors.
- **Key View Components**: Form with inputs (date picker, text fields, select for status), submit/cancel buttons.
- **UX, Accessibility, and Security Considerations**: Client-side validation with inline Polish errors; native date input for accessibility; prevent submission of invalid data; sanitize inputs to avoid injection risks.

### Account Settings View
- **View Path**: `/settings` (via profile menu)
- **Main Purpose**: Allow users to manage account details, including password changes and account deletion.
- **Key Information to Display**: Form for password change; delete account option with confirmation.
- **Key View Components**: Settings form, confirmation modal for deletion.
- **UX, Accessibility, and Security Considerations**: Secure password handling (no visibility); multi-step confirmation for deletion; ARIA alerts for success/error; enforce strong password policies.

### Login/Registration Views
- **View Path**: `/login`, `/register`
- **Main Purpose**: Handle user authentication entry points (deferred for MVP but planned).
- **Key Information to Display**: Forms for email/password; error messages for invalid credentials.
- **Key View Components**: Auth forms, submit buttons, links to switch between login/register.
- **UX, Accessibility, and Security Considerations**: Password masking; focus on first input; redirect to dashboard on success; prepare for JWT token storage securely.

## 3. User Journey Map

1. **Onboarding/Entry**: User arrives at login/register (future); for MVP, direct to `/dashboard`. If no applications, empty state prompts adding first via CTA button, navigating to add form.
2. **Adding Application**: From dashboard, click "Add Application" → `/applications/new` form → fill required fields (company, position, date; default status "Sent") → submit (POST to API) → redirect to `/dashboard` with new item at top.
3. **Viewing and Managing List**: On `/dashboard`, browse sorted list; filter by status dropdown → list updates; click row → `/applications/:id` for details.
4. **Quick Status Update**: On dashboard list, select from status dropdown → immediate UI update (PATCH to API optimistically) → confirmation toast.
5. **Editing Application**: In details view, click "Edit" → fields become editable → update fields → save (PATCH to API) → stay in view or redirect.
6. **Deleting Application**: In details, click "Delete" → confirmation modal → confirm → DELETE to API → redirect to `/dashboard`.
7. **Viewing Stats**: From nav, click "Stats" → `/stats` loads with counts; manual refresh if needed.
8. **Account Management**: Click profile icon → dropdown → "Account Settings" → modal/form for changes → "Logout" ends session, redirects to login.
9. **Error Handling Flow**: On API failure (e.g., 400 validation), show inline/toast errors; retry buttons refetch or resubmit.
10. **Empty/Edge States**: No apps → empty dashboard; no matches on filter → "No applications match filter"; network error → retry prompt.

## 4. Layout and Navigation Structure

- **Global Layout**: Persistent header at top with logo, nav links ("Dashboard", "Stats"), profile dropdown (avatar icon → "Account Settings", "Logout"; hamburger on mobile). Main content area below, footer optional with feedback link to Google Form.
- **Navigation Methods**: Direct links in header for Dashboard/Stats; dynamic routing for `/applications/:id` via list clicks; modals for forms/settings to avoid full page loads; back button support with history API.
- **Mobile Adaptation**: Collapsible nav menu (hamburger icon); touch-friendly buttons (>44px); swipe for list scrolling.
- **Routing**: Client-side routing with Astro pages and React for interactive sections; prefetch links on hover for performance.
- **Breadcrumbs**: Optional in details view (e.g., Dashboard > Application XYZ) for deep navigation.

## 5. Key Components

- **Header/Navigation Bar**: Persistent top bar with links, profile menu; responsive collapse.
- **Application List**: Table grid displaying applications; sortable, filterable; includes status dropdown for quick updates.
- **Application Form**: Reusable form for add/edit with validation; fields: text inputs, date picker, URL input, textarea, select.
- **Status Dropdown**: Select menu with enum options; optimistic update handler.
- **Confirmation Modal**: Dialog for delete/account actions; includes trap focus, ESC/close button.
- **Empty State**: Centered illustration/text/CTA; used in dashboard and filtered lists.
- **Toast Notifications**: For success/error/confirmation; positioned top-right, auto-dismiss.
- **Loading Spinner**: Inline indicators for API calls; full-screen for page loads.
- **Error Boundary**: Catches render errors, shows friendly message with retry.
- **Feedback Link**: Fixed button or footer link to external Google Form for user opinions.
