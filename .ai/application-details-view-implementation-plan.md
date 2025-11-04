# View Implementation Plan Application Details

## 1. Overview

The Application Details View provides a dedicated page for users to review, edit, and delete a specific job application. It displays all relevant information about the application in a readable format and allows inline editing for quick updates, along with a confirmation modal for safe deletion. This view enhances user management of their job search by centralizing access to individual application details within the JobHop MVP.

## 2. View Routing

The view should be accessible at the path `/applications/:id`, where `:id` is a dynamic parameter representing the UUID of the specific application.

## 3. Component Structure

- ApplicationDetailsPage (Astro page): Wraps the layout and renders the main React component.
  - Layout (Astro): Global header and footer.
  - ApplicationDetailsView (React): Main container for details display, edit form, and delete modal.
    - ApplicationFields (React): Read-only or editable display of application data.
    - EditApplicationForm (React): Form for updating application fields (toggles visibility).
    - DeleteConfirmationModal (React): Modal for confirming deletion.

## 4. Component Details

### ApplicationDetailsPage

- Component description: Astro page that handles routing parameters and renders the client-side React component for the details view. Ensures server-side prerendering is disabled for dynamic content.
- Main elements: `<main>` container, `<ClientOnly>` wrapper for React hydration, passes `id` from params to the React component.
- Handled interactions: None (server-side); delegates to child React component.
- Handled validation: None.
- Types: `Params` from Astro (`{ id: string }`).
- Props: None (top-level page).

### ApplicationDetailsView

- Component description: Primary React component that fetches and displays application details, manages edit and delete states, and handles API interactions. Uses a custom hook for data fetching.
- Main elements: `<div className="container mx-auto p-4">` for layout, integrates `ApplicationFields`, conditional `EditApplicationForm`, `EditButton`, `DeleteButton`, and `DeleteConfirmationModal`. Uses Tailwind for styling and Shadcn/ui components where applicable.
- Handled interactions: onLoad (fetch data), onEditToggle (switch to edit mode), onSave (PATCH update), onDeleteConfirm (DELETE and redirect), onCancel (close modal or exit edit).
- Handled validation: Client-side form validation for required fields (company_name, position_name, application_date) using Zod schema similar to CreateApplicationRequestSchema but partial for updates; displays inline errors.
- Types: `ApplicationResponse` for data, `UpdateApplicationCommand` for PATCH body, `ApiErrorResponse` for errors.
- Props: `{ id: string }` from parent page.

### ApplicationFields

- Component description: Renders application data in a structured, read-only format (or editable inputs in edit mode). Supports displaying links as clickable and formatting dates.
- Main elements: `<dl className="grid grid-cols-1 md:grid-cols-2 gap-4">` for key-value pairs (e.g., `<dt>` for labels, `<dd>` for values); conditional rendering of `<input>`, `<textarea>`, `<select>` for edit mode; `<a>` for link field.
- Handled interactions: onChange for form inputs during edit.
- Handled validation: Real-time validation on input change for required fields; disables save if invalid.
- Types: `ApplicationDto` for display data.
- Props: `{ application: ApplicationDto, isEditing: boolean, onChange: (field: string, value: any) => void }`.

### EditApplicationForm

- Component description: Inline form that populates with current application data for editing. Handles submission to update via API.
- Main elements: Form with fields matching application schema (text inputs for company/position, date input, URL input for link, textarea for notes, select for status); submit/cancel buttons using Shadcn/ui Button.
- Handled interactions: onSubmit (validate and PATCH), onCancel (revert to view mode).
- Handled validation: Uses Zod's `UpdateApplicationRequestSchema` (partial schema); required fields must be non-empty strings, date valid YYYY-MM-DD, status enum value; shows error messages below fields.
- Types: `Partial<CreateApplicationCommand>` for form state, excluding id and user_id.
- Props: `{ application: ApplicationDto, onSubmit: (data: Partial<CreateApplicationCommand>) => void, onCancel: () => void }`.

### DeleteConfirmationModal

- Component description: Shadcn/ui-based modal that confirms deletion to prevent accidental removals. Displays application name for context.
- Main elements: `<Dialog>` from Shadcn/ui with `<DialogContent>` containing warning message, company name, confirm/cancel buttons.
- Handled interactions: onOpenChange (toggle visibility), onConfirm (trigger DELETE).
- Handled validation: None (simple confirmation).
- Types: None specific.
- Props: `{ isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void, applicationName: string }`.

## 5. Types

The view relies on existing types from `src/types/index.ts` (inferred from service and API):

- `ApplicationDto`: Interface for application data { id: string; company_name: string; position_name: string; application_date: string; link: string | null; notes: string | null; status: ApplicationStatus; created_at: string; updated_at: string }.
- `ApplicationStatus`: Type enum ['planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer'] (maps to Polish: 'Zaplanowane do wysłania', etc., but uses English keys in API).
- `ApplicationResponse`: Extends `ApplicationDto` for API responses.
- `ApiErrorResponse`: { error: string }.

New types for this view:

- `UpdateApplicationCommand`: Extends `CreateApplicationCommand` but partial, excluding user_id and id (server sets user_id; id from path). Fields: { company_name?: string; position_name?: string; application_date?: string; link?: string | null; notes?: string | null; status?: ApplicationStatus }. Used for PATCH body.
- `UpdateApplicationRequestSchema`: Zod schema z.object({ company_name: z.string().min(1).max(255).optional(), position_name: z.string().min(1).max(255).optional(), application_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), link: z.string().url().or(z.null()).optional(), notes: z.string().max(1000).optional(), status: z.enum(ApplicationStatus).optional() }). Explains partial updates, with validation for provided fields.
- `ApplicationViewModel`: View-specific type extending `ApplicationDto` with { formattedDate: string (e.g., 'November 4, 2025'), statusLabel: string (Polish display name, e.g., 'Wysłane' for 'sent') }. Used for UI-friendly display.

## 6. State Management

State is managed locally within the React components using `useState` hooks in `ApplicationDetailsView`:

- `application: ApplicationResponse | null` - Holds fetched data; initial null, updates on load/successful PATCH.
- `isEditing: boolean` - Toggles between view and edit modes; false initially.
- `showDeleteModal: boolean` - Controls modal visibility; false initially.
- `error: string | null` - Stores API or validation errors; cleared on new actions.
- `loading: boolean` - Indicates fetch/update/delete in progress.

A custom hook `useApplication(id: string)` is required: Uses `useState` and `useEffect` to fetch via GET /api/applications/{id} on mount; returns { data, loading, error, refetch }. For form state in `EditApplicationForm`, use `useState` with initial values from `application`, or integrate `react-hook-form` for better validation handling. No global state (e.g., Redux) needed for MVP; local state suffices for this isolated view.

## 7. API Integration

Integrate with the following endpoints using `fetch` in the custom hook and handlers:

- GET `/api/applications/{id}`: Fetch details on component mount. Request: None. Response: 200 -> `ApplicationResponse`; Errors: 401/403/404 -> `ApiErrorResponse` (handle redirect for auth/not found, show message for forbidden).
- PATCH `/api/applications/{id}`: Update on form submit. Request: JSON body of type `Partial<UpdateApplicationCommand>` (only changed fields). Response: 200 -> `ApplicationResponse` (update local state); Errors: 400 (validation) -> show form errors, 401/403/404 -> appropriate messages.
- DELETE `/api/applications/{id}`: On modal confirm. Request: None. Response: 204 (success, redirect to /dashboard); Errors: 401/403/404 -> show error toast, keep modal open.

Use `DEFAULT_USER_ID` implicitly via API (MVP); future: include auth token in headers. Handle JSON parsing and status checks in a utility function.

## 8. User Interactions

- **Loading Details**: On page load, fetch and display application data in read-only fields; show spinner if loading, error message if failed (e.g., 404 -> redirect to dashboard with 'Application not found').
- **View Mode**: All fields displayed as text/links; status as badge/label. Link field clickable to open in new tab.
- **Initiate Edit**: Click 'Edit' button -> set isEditing true, render form with current values pre-filled, focus on first field.
- **Edit Fields**: User modifies inputs; real-time validation highlights errors (red border, message); status select updates dropdown.
- **Save Changes**: Click 'Save' -> validate form; if valid, PATCH to API, on success update state and toggle back to view mode with success toast; on error, show inline errors or toast.
- **Cancel Edit**: Click 'Cancel' -> discard changes, revert to view mode without API call.
- **Initiate Delete**: Click 'Delete' button -> open modal with confirmation text including company name.
- **Confirm Delete**: Click 'Yes, Delete' in modal -> DELETE to API, on 204 redirect to /dashboard; on error, close modal and show toast.
- **Cancel Delete**: Click 'No' or close modal -> hide modal, no action.
- **Navigation**: 'Back to Dashboard' button always visible, links to /dashboard.

All interactions use keyboard-friendly elements (e.g., Enter to submit, ESC to cancel); mobile: touch targets >=44px.

## 9. Conditions and Validation

- **API Preconditions**: Valid UUID `id` param (Astro routing handles); user ownership verified server-side (403 if not). Component: If 404/403, show error UI or redirect; assume auth in MVP.
- **Form Validation (Edit)**: Affects `EditApplicationForm` state - disable submit button if invalid; show errors on submit or blur. Conditions:
  - company_name: required (min 1 char, max 255), string.
  - position_name: required (min 1, max 255), string.
  - application_date: required, valid YYYY-MM-DD format (native date input enforces).
  - link: optional URL or null.
  - notes: optional, max 1000 chars.
  - status: required, valid enum value (default current if unchanged).
  If any required field empty/invalid, set error state, prevent submit, highlight fields.
- **Delete Confirmation**: Modal requires explicit yes; affects interface by preventing accidental delete, modal open state blocks background interaction.
- **Loading/Empty States**: If no data (initial or error), show skeleton or message; post-delete, redirect clears view.

Validation uses Zod for schema parsing; integrates with form state to update UI (e.g., error class on invalid inputs).

## 10. Error Handling

- **Fetch Errors (GET)**: Network failure -> show 'Failed to load application. Retry?' with refetch button; 404 -> redirect to /dashboard with toast 'Application not found'; 500 -> generic error toast, log to console.
- **Update Errors (PATCH)**: 400 validation -> populate form errors from API response, highlight fields; 403/404 -> toast 'Cannot update: access denied/not found', revert form; network -> 'Update failed, please try again'.
- **Delete Errors (DELETE)**: 403/404 -> close modal, toast 'Cannot delete: access issue'; network -> retry option in toast; log all errors with context (id, timestamp) to console for debugging.
- **General Edge Cases**: Invalid date input -> browser validation + Zod; empty notes/link -> null handling; optimistic UI for updates (show loading on buttons). Use try-catch in async handlers; display user-friendly messages via toasts (Shadcn/ui Toast); no sensitive error details exposed. For MVP, no auth errors handled (assume logged in).

## 11. Implementation Steps

1. Create the Astro page file at `src/pages/applications/[id].astro`: Import Layout, use `<Params>` to get id, render `<ClientOnly>` with `<ApplicationDetailsView client:load id={Astro.params.id} />`; set `export const prerender = false;`.

2. Implement types in `src/types/index.ts`: Add `UpdateApplicationCommand`, `UpdateApplicationRequestSchema`, `ApplicationViewModel` as described; ensure compatibility with existing.

3. Create custom hook `src/hooks/useApplication.ts`: Use `useState`, `useEffect` for fetch; handle loading/error/refetch; export interface for return type.

4. Build `ApplicationDetailsView` in `src/components/ApplicationDetailsView.tsx`: Manage states, integrate hook, render children conditionally; add Tailwind classes for layout.

5. Develop `ApplicationFields` in `src/components/ApplicationFields.tsx`: Conditional render based on isEditing; map fields to elements, format for display (e.g., new Date for date).

6. Implement `EditApplicationForm` in `src/components/EditApplicationForm.tsx`: Use `useState` for form data, Zod for validation; onSubmit handler calls parent onSubmit.

7. Create `DeleteConfirmationModal` in `src/components/DeleteConfirmationModal.tsx`: Use Shadcn/ui Dialog; wire onConfirm to parent.

8. Add API utilities in `src/lib/api/applications.ts`: Functions for GET/PATCH/DELETE with fetch, error handling; use JSON headers.

9. Integrate interactions: In view, handle button clicks to toggle states, call API utils, update state on success; add redirect with `window.location.href = '/dashboard';`.

10. Style and accessibility: Apply Tailwind/Shadcn; add ARIA labels (e.g., role='dialog' for modal, aria-invalid for errors); test responsive design.
