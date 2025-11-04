# Remaining Changes for Dashboard View Implementation

This document outlines the specific changes, fixes, and additions still needed to fully implement the Dashboard View according to the implementation plan. It focuses only on gaps identified by comparing the current codebase to the plan. Fully implemented features (e.g., basic routing in `src/pages/dashboard.astro`, core structure of `DashboardView.tsx`, existence of child components like `StatusFilter.tsx` and `ApplicationList.tsx`) are not repeated here.

## 1. Custom Hooks

### useApplications Hook (`src/hooks/useApplications.ts`)
- **Current State**: Hook exists and is imported/used in `DashboardView.tsx`. It provides `data`, `refetch`, and `updateStatus`. However, filtering is not fully integrated.
- **Remaining Changes**:
  - Modify the hook to accept a `filter` parameter (`ApplicationStatus | 'all'`) and pass it to the API query: Append `?status=${filter !== 'all' ? filter : ''}` to the GET `/api/applications` URL.
  - In `useEffect`, watch for `filter` changes to trigger `refetch` automatically when the filter updates.
  - Implement transformation of `ApplicationDto[]` to `ApplicationViewModel[]`: For each application, add `formattedDate` using `Intl.DateTimeFormat('pl-PL', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(application.application_date))` and `statusLabel` from `statusLabels`.
  - Update return type to include `data: { applications: ApplicationViewModel[], currentFilter: ApplicationStatus | 'all', pagination: PaginationDto, loading: boolean, error: string | null }`.
  - Add optimistic update logic in `updateStatus`: Temporarily update the local `applications` array (find by `id` and set `status`/`statusLabel`), then call PATCH, revert on error.
  - Handle pagination defaults: Hardcode `page=1&limit=20`; if `pagination.total > pagination.limit`, prepare for future pagination UI (e.g., add `hasMore` flag).

### useStatusOptions Hook (`src/hooks/useStatusOptions.ts`)
- **Current State**: Imported and used to provide `statusOptions`.
- **Remaining Changes**:
  - Ensure it returns `StatusOption[]` where `StatusOption = { value: ApplicationStatus | 'all', label: string }`. Include 'all' option with label 'Wszystkie', and map `ApplicationStatus` to Polish labels from `statusLabels`.
  - Memoize with `useMemo` to avoid recomputation.

## 2. Component Updates

### DashboardView (`src/components/DashboardView.tsx`)
- **Current State**: Basic layout with header, `StatusFilter`, `AddApplicationButton`, and `ApplicationList`. Handlers for filter, status change, row click, and add click exist, but navigation uses `window.location.href`.
- **Remaining Changes**:
  - Replace `window.location.href` in `handleRowClick` and `handleAddClick` with client-side navigation: Import `useNavigate` from 'react-router-dom' (if using React Router in Astro) or use Astro's `<Link>` component wrapped in the handlers. For example: `const navigate = useNavigate(); navigate(`/applications/${id}`);`.
  - Integrate filter state: Add `useState` for `filter: ApplicationStatus | 'all' = 'all'`, pass to `useApplications(filter)`, and to `StatusFilter` as `value`. Update `handleFilterChange` to `setFilter(newFilter);` (removes TODO comment).
  - Add loading and error display: Conditionally render a spinner (e.g., shadcn Skeleton or simple div) if `data.loading`, and error banner if `data.error` (e.g., `<div className="text-red-500">{data.error} <button onClick={refetch}>Retry</button></div>`).
  - Ensure `useToast` from shadcn is imported and used for notifications in status updates (pass `updateStatus` already calls it internally via hook).
  - Add ARIA landmarks: Wrap main content in `<main role="main" aria-label="Dashboard">`.

### StatusFilter (`src/components/StatusFilter.tsx`)
- **Current State**: Exists and receives `filter`, `onFilterChange`, `options`.
- **Remaining Changes**:
  - Use shadcn `<Select>` with `<SelectTrigger aria-label="Filter applications by status">` and `<SelectContent>`. Map `options` to `<SelectItem value={option.value}>{option.label}</SelectItem>`.
  - Add `aria-expanded` and `aria-controls` if using custom dropdown logic.
  - Ensure `onValueChange={(value) => onFilterChange(value as ApplicationStatus | 'all')}` with type assertion after validation.

### AddButton (or AddApplicationButton) (`src/components/AddApplicationButton.tsx`)
- **Current State**: Exists, receives `onClick`.
- **Remaining Changes**:
  - Use shadcn `<Button variant="default" size="lg">` with Plus icon (import from lucide-react: `Plus`).
  - Add `aria-label="Add new application"` for accessibility.
  - Style with Tailwind: `bg-blue-600 hover:bg-blue-700 text-white`.

### EmptyState (`src/components/EmptyState.tsx`)
- **Current State**: Exists, used in `ApplicationList`.
- **Remaining Changes**:
  - Add variant prop `isFiltered?: boolean` to adjust message: If true, show "No applications match this filter. Try adjusting the filter."; else, "No applications yet. Start by adding your first one!".
  - Include SVG illustration (create simple inline SVG or import from assets) and center with Tailwind `flex flex-col items-center justify-center py-12`.
  - Embed `AddApplicationButton` as CTA with `onClick={props.onAddClick || handleAddClick}`.
  - Add `aria-live="polite"` for dynamic announcements.

### ApplicationTable (`src/components/ApplicationTable.tsx`)
- **Current State**: Likely exists as part of `ApplicationList`.
- **Remaining Changes**:
  - Use shadcn `<Table> <TableHeader> <TableRow> <TableHead>Company</TableHead> <TableHead>Position</TableHead> <TableHead>Status</TableHead> </TableRow> </TableHeader> <TableBody>` structure.
  - Add `role="table" aria-label="Applications list"` to `<Table>`.
  - For mobile: Wrap in `<div className="overflow-x-auto">` and use responsive classes (e.g., `hidden sm:table-cell` for headers).
  - Map `applications` to `<ApplicationRow key={app.id} application={app} onClick={onRowClick} onStatusChange={onStatusChange} />`.
  - Only render if `applications.length > 0`; else, defer to parent `ApplicationList`.

### ApplicationRow (`src/components/ApplicationRow.tsx`)
- **Current State**: Exists, receives `app`, handlers.
- **Remaining Changes**:
  - Use shadcn `<TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onClick(app.id)} role="row">`.
  - Child cells: `<TableCell>{app.company_name}</TableCell> <TableCell>{app.position_name}</TableCell> <TableCell><StatusDropdown value={app.status} onChange={(s) => onStatusChange(app.id, s)} applicationId={app.id} /></TableCell>`.
  - Stop propagation on dropdown: In `StatusDropdown`, add `onClick={(e) => e.stopPropagation()}` to trigger.
  - Display `formattedDate` if needed (e.g., in a tooltip or additional cell).

### StatusDropdown (`src/components/StatusDropdown.tsx`)
- **Current State**: Exists, used in rows.
- **Remaining Changes**:
  - Use shadcn `<Select>`: `<SelectTrigger aria-label={`Current status: ${statusLabels[value]}`}>{statusLabels[value]}</SelectTrigger> <SelectContent> map options to <SelectItem>{label}</SelectItem> </SelectContent>`.
  - On `onValueChange={(newValue) => { if (newValue !== value) onChange(newValue as ApplicationStatus); }}` to avoid no-op calls.
  - Disable if parent loading: Receive `disabled?: boolean` prop.
  - Add brief visual feedback: Use CSS transition for color change based on status (e.g., via Tailwind variants).

### ApplicationList (`src/components/ApplicationList.tsx`)
- **Current State**: Renders applications, loading, error; receives handlers and options.
- **Remaining Changes**:
  - Conditional render: If `loading`, show `<div className="flex justify-center py-8"><Spinner /></div>` (implement simple Spinner or use shadcn).
  - If `error`, show `<div className="border border-red-200 bg-red-50 p-4 rounded"><p className="text-red-700">{error}</p><button onClick={refetch} className="ml-2 text-blue-600">Retry</button></div>`.
  - If `applications.length === 0`, render `<EmptyState isFiltered={currentFilter !== 'all'} onAddClick={onAddClick} />`.
  - Else, render `<ApplicationTable applications={applications} onRowClick={onRowClick} onStatusChange={onStatusChange} />`.
  - Pass `statusOptions` to children if needed.

## 3. API Integration

- **Current State**: `useApplications` fetches GET `/api/applications` but without filter param; `updateStatus` exists but details unclear.
- **Remaining Changes**:
  - In `useApplications`, construct URL dynamically: `const url = new URL('/api/applications', import.meta.env.PUBLIC_SERVER_URL || window.location.origin); if (filter !== 'all') url.searchParams.set('status', filter); url.searchParams.set('page', '1'); url.searchParams.set('limit', '20');`.
  - For PATCH in `updateStatus`: `const response = await fetch(`/api/applications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); if (!response.ok) throw new Error(await response.text());`.
  - On PATCH success, optionally call `refetch()` to sync; on error, revert local state: Use functional update like `setApplications(prev => prev.map(app => app.id === id ? { ...app, status: oldStatus, statusLabel: oldLabel } : app))`.
  - Add type guards: After parsing JSON, check `if (!isValidApplicationStatus(response.status)) throw new Error('Invalid status');`.
  - Handle 401/403: If implemented, redirect to login (for MVP, log error).

## 4. Types and ViewModels

- **Current State**: Relies on existing `src/types.ts`; `ApplicationViewModel` mentioned but may not be fully used.
- **Remaining Changes**:
  - If not present, extend `src/types.ts` or create `src/types/view.ts`: `export interface ApplicationViewModel extends ApplicationDto { formattedDate: string; statusLabel: string; }` and `export interface StatusOption { value: ApplicationStatus | 'all'; label: string; }`.
  - Update hook return to use `ApplicationViewModel[]` for `applications`.
  - Import and use in components: Props like `application: ApplicationViewModel`.

## 5. Accessibility and Responsiveness

- **Current State**: Basic Tailwind classes present (e.g., `flex-col sm:flex-row`).
- **Remaining Changes**:
  - Add ARIA: `<main aria-labelledby="dashboard-title">`, `<h1 id="dashboard-title">Moje aplikacje</h1>`. For table: `aria-label="List of job applications"`. For Selects: `aria-describedby="filter-help"` with help text if needed.
  - Dynamic announcements: Add `<div aria-live="polite" aria-atomic="true" className="sr-only">` for filter changes (e.g., "Applications filtered by Wysłane") and status updates.
  - Mobile: Ensure table scrolls horizontally (`overflow-x-auto`); stack rows as cards on small screens if needed (use `md:table` variants).
  - Keyboard: Test Tab/Enter on dropdowns; add `focus-visible` styles via Tailwind.

## 6. Error Handling and User Feedback

- **Current State**: `error` passed to `ApplicationList`, but display unclear; toasts not explicitly used.
- **Remaining Changes**:
  - Import `useToast` from '@/components/ui/sonner' (shadcn toast); in `updateStatus` error: `toast.error('Update failed: ' + err.message)`.
  - For success: `toast.success('Status updated successfully')`.
  - In `DashboardView`, add `<Toaster />` (shadcn provider) at root.
  - Offline handling: In fetch, if (!navigator.onLine) set error "No internet connection".

## 7. Testing and Polish

- **Remaining Changes**:
  - Add unit tests: In `__tests__/DashboardView.test.tsx`, test rendering, filter change triggers refetch, status update optimistic + revert.
  - Manual tests: Verify empty state variants, mobile table scroll, ARIA with screen reader.
  - Performance: Memoize `statusOptions`; use `React.memo` on `ApplicationRow` if re-renders frequent.
  - Integrate feedback link: Add fixed button or in layout for Google Form.
  - Linting: Run `read_lints` on updated files; fix any TS errors (e.g., prop types).

## Next Steps
Prioritize: 1. Hook updates for filter/API. 2. Client-side navigation. 3. Optimistic updates with toasts. 4. Accessibility additions. After these, test end-to-end and mark complete.
