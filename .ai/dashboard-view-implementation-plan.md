# Dashboard View Implementation Plan

## 1. Overview

The Dashboard View serves as the primary landing page after user login in the JobHop application. Its purpose is to provide an overview and management interface for all job applications, displaying them in a sortable and filterable list. It includes quick status updates, navigation to details, an empty state for new users, and a call-to-action to add new applications. The view emphasizes simplicity, responsiveness, and real-time updates to enhance user productivity in tracking job search progress.

## 2. View Routing

The view should be accessible at the path `/dashboard`. This is the default route after successful authentication (for MVP, accessible directly). It will be implemented as an Astro page at `src/pages/dashboard.astro`, with React components loaded as islands for interactivity.

## 3. Component Structure

- **DashboardPage** (Astro page): Root container integrating layout and the main React view.
  - **MainLayout** (Astro layout): Includes navigation header with links to Dashboard, Statistics, and user profile menu.
    - **DashboardView** (React component): Core interactive view.
      - **AddApplicationButton** (React): Button to navigate to application creation.
      - **StatusFilter** (React): Dropdown for filtering applications by status.
      - **ApplicationList** (React): Manages display of list or empty state.
        - **EmptyState** (React): Conditional component for no applications.
        - **ApplicationTable** (React): Table rendering the list of applications.
          - **ApplicationRow** (React, repeated): Row for each application.
            - **CompanyCell**, **PositionCell** (React): Display cells for company and position.
            - **StatusDropdown** (React): Per-row dropdown for status changes.

## 4. Component Details

### DashboardPage (Astro)

- **Component description**: Astro page that wraps the DashboardView in the main layout, handles basic routing guards (future auth), and ensures SSR compatibility. Consists of header navigation and the main content area.
- **Main elements**: `<MainLayout>` wrapper, `<DashboardView client:load>` for React hydration.
- **Handled interactions**: None directly; delegates to child React components.
- **Handled validation**: None; relies on API for data validation.
- **Types**: ApplicationListResponseDto (imported from `src/types.ts`).
- **Props**: None (top-level page).

### DashboardView (React)

- **Component description**: Main React island managing state, API integration, and rendering of list/filter components. Fetches applications on mount and handles refetching.
- **Main elements**: `<AddApplicationButton>`, `<StatusFilter>`, `<ApplicationList>`. Uses Tailwind for layout (e.g., flex container).
- **Handled interactions**: Filter changes trigger refetch; status updates via child callbacks.
- **Handled validation**: Ensures filter status is a valid ApplicationStatus using `isValidApplicationStatus` guard before API call. Disables interactions during loading.
- **Types**: FilteredApplicationsViewModel (custom), ApplicationDto, ApplicationStatus (from `src/types.ts`).
- **Props**: None (self-contained); uses internal hooks.

### AddApplicationButton (React)

- **Component description**: Prominent button (using Shadcn Button) to add a new application, placed at the top-right. Links to creation form.
- **Main elements**: `<Button>` with icon (e.g., plus), text "Add Application".
- **Handled interactions**: Click navigates to `/applications/new` using Astro's router or `useNavigate`.
- **Handled validation**: None.
- **Types**: None.
- **Props**: { onClick?: () => void } (optional callback before navigation).

### StatusFilter (React)

- **Component description**: Dropdown (Shadcn Select) above the table to filter by status, including "All" option. Triggers API refetch on change.
- **Main elements**: `<Select>` with `<SelectTrigger>` (label "Filter by Status") and `<SelectContent>` with options from status enums.
- **Handled interactions**: `onValueChange` updates filter state and calls refetch.
- **Handled validation**: Validates selected value against ApplicationStatus enum; resets to 'all' if invalid.
- **Types**: StatusOption[] (custom: {value: ApplicationStatus | 'all', label: string}), ApplicationStatus.
- **Props**: { filter: ApplicationStatus | 'all', onFilterChange: (status: ApplicationStatus | 'all') => void, options: StatusOption[] }.

### ApplicationList (React)

- **Component description**: Conditional renderer: shows EmptyState if no applications, otherwise ApplicationTable. Handles loading/error states.
- **Main elements**: `<div>` container; conditional `<EmptyState>` or `<ApplicationTable>`. Spinner for loading (Shadcn).
- **Handled interactions**: Delegates to children (e.g., status changes).
- **Handled validation**: Checks if applications.length === 0 for empty state.
- **Types**: FilteredApplicationsViewModel, ApplicationDto[].
- **Props**: { applications: ApplicationDto[], loading: boolean, error?: string, onStatusChange: (id: string, status: ApplicationStatus) => void, onRowClick: (id: string) => void }.

### EmptyState (React)

- **Component description**: User-friendly message for new users with no applications, including illustration and CTA button.
- **Main elements**: Centered `<div>` with icon/illustration (Tailwind/SVG), text "No applications yet. Add your first one!", and `<AddApplicationButton>`.
- **Handled interactions**: CTA click navigates to add form.
- **Handled validation**: None.
- **Types**: None.
- **Props**: { onAddClick: () => void }.

### ApplicationTable (React)

- **Component description**: Responsive table (Shadcn Table) displaying applications. Uses Tailwind for mobile card fallback if needed.
- **Main elements**: `<Table>`, `<TableHeader>` with columns (Company, Position, Status), `<TableBody>` with `<ApplicationRow>` for each.
- **Handled interactions**: Row clicks via child handlers.
- **Handled validation**: Ensures data matches ApplicationDto shape (TypeScript).
- **Types**: ApplicationDto[], ApplicationRowViewModel.
- **Props**: { applications: ApplicationDto[], onStatusChange: (id: string, status: ApplicationStatus) => void, onRowClick: (id: string) => void }.

### ApplicationRow (React)

- **Component description**: Single table row for an application, clickable for details, with status dropdown.
- **Main elements**: `<TableRow>` (role="row", clickable), child cells: `<CompanyCell>`, `<PositionCell>`, `<StatusDropdown>`.
- **Handled interactions**: Click anywhere on row triggers onRowClick; status select triggers onStatusChange.
- **Handled validation**: Status changes validated with `isValidApplicationStatus`.
- **Types**: ApplicationRowViewModel, StatusOption[].
- **Props**: { app: ApplicationDto, onStatusChange: (status: ApplicationStatus) => void, onRowClick: () => void, options: StatusOption[] }.

### StatusDropdown (React)

- **Component description**: Per-row dropdown (Shadcn DropdownMenu) for quick status updates, with Polish labels.
- **Main elements**: `<DropdownMenu>` trigger (current status badge), content with `<DropdownMenuItem>` for each option.
- **Handled interactions**: `onSelect` calls parent handler for update.
- **Handled validation**: Only valid enums selectable; optimistic update checked post-API.
- **Types**: ApplicationStatus, StatusOption[].
- **Props**: { currentStatus: ApplicationStatus, onSelect: (status: ApplicationStatus) => void, options: StatusOption[] }.

## 5. Types

- **Existing Types (from src/types.ts)**:
  - `ApplicationStatus`: Enum type for statuses ('planned' | 'sent' | 'in_progress' | 'interview' | 'rejected' | 'offer').
  - `ApplicationDto`: { id: string, company_name: string, position_name: string, application_date: string (ISO 'YYYY-MM-DD'), link?: string | null, notes?: string | null, status: ApplicationStatus, created_at: string (ISO), updated_at: string (ISO) }.
  - `ApplicationListResponseDto`: { applications: ApplicationDto[], pagination: { total: number, page: number, limit: number } }.
  - `isValidApplicationStatus(status: string): status is ApplicationStatus`: Type guard for status validation.

- **New Custom ViewModel Types**:
  - `StatusOption`: Array of options for dropdowns and filters. Fields: { value: ApplicationStatus | 'all', label: string (Polish, e.g., 'all' -> 'Wszystkie', 'sent' -> 'Wysłane', 'interview' -> 'Rozmowa', etc., based on PRD statuses) }. Purpose: Bridges English data enums to user-facing Polish labels for internationalization.
  - `FilteredApplicationsViewModel`: State model for the view. Fields: { applications: ApplicationDto[] (full fetched list), filteredApplications: ApplicationDto[] (current view after filter), currentFilter: ApplicationStatus | 'all', pagination: { total: number, page: number, limit: number }, loading: boolean, error?: string }. Purpose: Manages API data alongside UI state for filtering, loading, and errors; enables optimistic updates by mutating filteredApplications temporarily.
  - `ApplicationRowViewModel`: Props interface for rows. Fields: { id: string, companyName: string, positionName: string, status: ApplicationStatus, onStatusChange: (newStatus: ApplicationStatus) => Promise<void>, onRowClick: (id: string) => void }. Purpose: Typed props for ApplicationRow, ensuring handlers are passed correctly and data is subset of ApplicationDto for performance.
  - `PaginationDto`: Already existing { total: number, page: number, limit: number }, used in ViewModel for potential future pagination UI.

These types ensure type safety across components, with ViewModels extending DTOs to include UI-specific fields like handlers and labels.

## 6. State Management

State is managed locally within the DashboardView React component using React hooks (useState, useEffect) for simplicity, as this is a self-contained view without global needs in MVP. No Redux/Zustand required.

- `applications`: useState<ApplicationDto[]>([]) – Stores fetched data from API.
- `filter`: useState<ApplicationStatus | 'all'>('all') – Tracks current filter selection.
- `loading`: useState<boolean>(false) – Indicates fetch/status update in progress.
- `error`: useState<string | null>(null) – Holds error messages for display.

A custom hook `useApplications` encapsulates fetching and updates:

- Uses useState for local state.
- useEffect for initial fetch on mount (GET /api/applications with current filter).
- Exposes refetch function for filter changes and updateStatus for optimistic edits (mutate local state, API call, revert on error).
- Returns { data: FilteredApplicationsViewModel, refetch: () => void, updateStatus: (id: string, status: ApplicationStatus) => Promise<void> }.

Another hook `useStatusOptions` returns memoized StatusOption[] with Polish labels, computed once.

This approach keeps state lightweight, with parent-child prop drilling for handlers.

## 7. API Integration

Integrate with the GET `/api/applications` endpoint (src/pages/api/applications.ts) for fetching the list. No other endpoints for this view (status updates via future PATCH, but optimistic local for MVP).

- **Request**: Use native fetch in `useApplications` hook. Method: GET. URL: `/api/applications?status=${encodeURIComponent(filter)}&page=1&limit=20` (filter 'all' omits status param). Headers: { 'Content-Type': 'application/json' } (future: Authorization Bearer JWT). No body.
- **Response Type**: ApplicationListResponseDto – Parsed as JSON, validated against type (TypeScript inference). On success (200), update state with response.applications and pagination. Handle empty array for empty state.
- **Error Handling**: Catch network/validation errors (400/500), set error state. Future 401 redirects to login.
- **Query Params Validation**: Before fetch, use `isValidApplicationStatus` on filter if not 'all'; invalid resets to 'all'.

For status changes, implement optimistic local update; refetch full list post-success to sync.

## 8. User Interactions

- **Page Load**: Component mounts, `useApplications` fetches data (loading spinner shows). Success: renders list or EmptyState. Error: displays error message with retry button (calls refetch).
- **Filter Selection (StatusFilter)**: User selects status from dropdown. Validates selection, updates filter state, triggers refetch with new ?status= param. List updates immediately (optimistic via API response); shows loading briefly.
- **Status Change (StatusDropdown)**: User selects new status in row dropdown. Calls updateStatus: optimistically updates row's status in local state (immediate visual feedback), then PATCH /api/applications/{id} (future endpoint). Success: persists; failure: reverts status and shows toast error (using Shadcn Toast).
- **Row Click (ApplicationRow)**: Click anywhere on row (except dropdown) navigates to `/applications/${app.id}` for details view. Uses Astro's client-side routing to avoid full reload.
- **Add Button Click (AddApplicationButton or EmptyState CTA)**: Navigates to `/applications/new`. On return (browser back or form cancel), refetch to update list if new app added.
- **Keyboard Navigation**: Tab through filters/dropdowns/buttons; Enter to select/click. ARIA labels ensure screen reader support (e.g., "Filter applications by status: All").

All interactions provide immediate feedback (spinners, toasts) and are responsive (touch-friendly on mobile).

## 9. Conditions and Validation

- **API Query Conditions (StatusFilter, useApplications)**: Filter value must be 'all' or valid ApplicationStatus (verified with `isValidApplicationStatus` guard before constructing URL). If invalid, reset to 'all' and show brief toast "Invalid filter selected." Affects UI: Disables dropdown during loading; prevents refetch on invalid input.
- **Data Presence (ApplicationList)**: If fetched applications.length === 0, switch to EmptyState (hides table). Verified post-fetch in render logic.
- **Status Update Validation (StatusDropdown)**: New status must be ApplicationStatus (enum check on select). Affects UI: Options limited to valid enums; optimistic update only if valid, else ignored.
- **Pagination Limits (useApplications)**: Hardcode page=1, limit=20; if response.pagination.total > limit, log warning (future: add load more). Verified by checking response shape.
- **Loading/Error States (DashboardView)**: Set loading=true on fetch/update; affects entire list (overlay spinner). Error sets error state, hides list, shows message (e.g., "Failed to load. Retry?") with button to refetch. Components like Table disable interactions if loading/error.

These conditions ensure data integrity, with UI state changes (e.g., visibility, disabled props) reflecting validation outcomes.

## 10. Error Handling

- **Fetch Errors (Network/API 500)**: In `useApplications`, catch Error, set error="Failed to load applications. Please check your connection." Show toast (Shadcn) and error UI in ApplicationList with retry button (calls refetch). Log to console for debugging.
- **Validation Errors (API 400)**: Parse response.error, set error="Invalid parameters. Resetting filter." Auto-reset filter to 'all' and refetch. User sees toast.
- **Status Update Failures**: On PATCH error (future), revert optimistic change in local state, show toast "Status update failed. Please try again." Refetch list to sync.
- **Empty/Edge Cases**: No error for empty list (EmptyState). For no internet, browser fetch fails -> network error handling.
- **Type Mismatches**: TypeScript prevents at compile; runtime: guard response with typeof checks (e.g., if (!Array.isArray(response.applications)) set error).
- **Accessibility Errors**: Ensure fallback text for icons/labels; test manually.
- **Global Fallback**: Wrap DashboardView in React ErrorBoundary (if needed) to catch render errors, show "Something went wrong. Reload page."

Prioritize user-friendly messages (Polish if UI localized) and recovery actions (retry, reset).

## 11. Implementation Steps

1. Set up the Astro page: Create `src/pages/dashboard.astro` with `<MainLayout>` import (create if missing), add `<DashboardView client:load>` slot in main content. Import types from `src/types.ts`.
2. Install/Import Shadcn Components: Ensure Tailwind configured; add `npx shadcn-ui@latest add table select dropdown-menu button toast` (run via terminal if needed).
3. Define Custom Types: In a new `src/types/view.types.ts` (or extend existing), add StatusOption, FilteredApplicationsViewModel, ApplicationRowViewModel interfaces.
4. Create Hooks: Implement `useApplications` hook in `src/hooks/useApplications.ts` with fetch logic, optimistic update placeholder, and `useStatusOptions` for Polish labels (hardcode mappings from PRD: planned='Zaplanowane do wysłania', sent='Wysłane', etc.).
5. Build Components Bottom-Up: Start with leaf components (StatusDropdown, ApplicationRow, cells) using Shadcn primitives and Tailwind (e.g., `className="hover:bg-muted cursor-pointer"` for clickable rows). Add props and handlers.
6. Implement StatusFilter and AddApplicationButton: Use Select/Button from Shadcn; integrate onChange/onClick with parent callbacks.
7. Create ApplicationList and Table: Conditional render EmptyState/Table; use Shadcn Table for structure, map over props.applications for rows. Add loading spinner (`<Spinner>` or div).
8. Assemble DashboardView: Use useState for top-level state if needed, but prefer hook; render children with prop drilling. Add responsive classes (e.g., `grid md:table`).
9. Integrate Navigation: Use Astro's `<a>` for links or React `useNavigate` from 'react-router-dom' if SPA routing enabled (configure in Astro).
10. Add Validation/Guards: Integrate `isValidApplicationStatus` in filter/select handlers; add ARIA attributes (e.g., `aria-label="Filter by status"`).
11. Handle States: Implement loading (overlay), error (conditional div with message/retry), empty (EmptyState with SVG icon).
12. Test Interactions: Manually test fetch, filter, status change (mock API if needed), row click navigation, mobile responsiveness (Tailwind breakpoints). Ensure TypeScript compiles without errors.
13. Polish UI: Add icons (Lucide React via Shadcn), toasts for feedback, Polish labels via StatusOption. Verify accessibility with keyboard/tab navigation.
14. Future-Proof: Add comments for auth guard (check session), pagination if total > 20, full PATCH integration for status.
