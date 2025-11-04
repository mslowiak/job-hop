# Stats View Implementation Plan

## 1. Overview

The Statistics View provides a summary of the user's job applications categorized by status, allowing them to assess their job search progress. It displays counts for each application status (e.g., "Sent: 5") in a scannable grid layout, along with the total number of applications. The view fetches data from the API and supports manual refresh for updates.

## 2. View Routing

The view should be accessible at the path `/stats`, implemented as `src/pages/stats.astro`.

## 3. Component Structure

- StatsPage.astro (Astro page)
  - StatsView (React component) - Main container, handles data fetching and state
    - RefreshButton (React component) - Triggers data refetch
    - TotalDisplay (React component) - Shows the total count of applications
    - StatsGrid (React component) - Grid layout for status counts
      - StatusCard (React component) - Individual card for each status count (repeated for each status)

## 4. Component Details

### StatsView

- Component description: The primary React component for the statistics view. It fetches application statistics from the API, manages loading and error states, and renders the overall layout including total and grid of status counts. It uses Tailwind for styling to ensure a responsive, scannable design with large numbers for readability.
- Main elements: `<div>` container with Tailwind grid or flex layout; child components: RefreshButton, TotalDisplay, StatsGrid; loading spinner (using existing loader-circle component if available); error message div.
- Handled interactions: None directly; delegates refresh to RefreshButton click.
- Handled validation: Verifies API response structure matches ApplicationStatsDto; ensures all statuses are present with counts >= 0; displays error if total doesn't match sum of stats.
- Types: ApplicationStatsDto (from API response); StatsItem[] (derived ViewModel for grid items).
- Props: None (top-level component).

### RefreshButton

- Component description: A simple button component to manually refresh the statistics data. Uses the existing ui/button.tsx for consistency.
- Main elements: `<button>` with Tailwind classes for styling (e.g., bg-blue-500 text-white); optional icon (e.g., arrow-left or refresh icon if available); aria-label "Refresh statistics".
- Handled interactions: onClick event triggers refetch function from parent.
- Handled validation: None.
- Types: None specific.
- Props: onRefresh: () => void (callback to refetch data).

### TotalDisplay

- Component description: Displays the total number of applications in a prominent, large font for quick overview.
- Main elements: `<div>` with Tailwind classes (e.g., text-4xl font-bold text-center); label "Total Applications:" followed by count.
- Handled interactions: None.
- Handled validation: Ensures total is a non-negative integer; falls back to 0 if invalid.
- Types: number (total from ApplicationStatsDto).
- Props: total: number.

### StatsGrid

- Component description: A responsive grid component that arranges StatusCard components for each application status. Uses Tailwind grid classes for layout (e.g., grid-cols-2 md:grid-cols-3).
- Main elements: `<div class="grid ...">`; maps over StatsItem[] to render StatusCard; screen reader friendly with role="grid".
- Handled interactions: None.
- Handled validation: Ensures array has exactly 6 items (one per status); skips invalid items.
- Types: StatsItem[].
- Props: stats: StatsItem[].

### StatusCard

- Component description: Renders a single status count in a card-like format, showing the Polish label and count (e.g., "Wysłane: 5"). Styled with Tailwind for visual appeal (e.g., border, padding, hover effects).
- Main elements: `<div class="p-4 border rounded-lg">`; `<h3>` for label, `<p class="text-2xl">` for count; aria-label `${label}: ${count} applications`.
- Handled interactions: None.
- Handled validation: Validates status is valid ApplicationStatus, label from statusLabels, count >= 0.
- Types: StatsItem (status: ApplicationStatus, label: string, count: number).
- Props: status: ApplicationStatus, label: string, count: number.

## 5. Types

The view relies on existing types from `src/types.ts`:

- `ApplicationStatus`: Enum of possible statuses ["planned", "sent", "in_progress", "interview", "rejected", "offer"].
- `ApplicationStatsDto`: Interface with `stats: Record<ApplicationStatus, number>` (object with status keys and numeric counts) and `total: number` (sum of all counts).

New ViewModel type for the grid (add to `src/types.ts` or a view-specific file):

```typescript
export interface StatsItem {
  status: ApplicationStatus;
  label: string; // Polish display name from statusLabels
  count: number;
}
```

- `StatsItem`: Derived from ApplicationStatsDto by mapping stats object to array, adding labels using the existing `statusLabels` Record<ApplicationStatus, string>. Each item has a unique status key, human-readable label (e.g., "Wysłane" for "sent"), and non-negative integer count. Used for rendering the StatsGrid to ensure consistent ordering and accessibility.

No new DTOs needed, as API uses existing ApplicationStatsDto.

## 6. State Management

State is managed locally within the StatsView React component using React hooks:

- `useState<ApplicationStatsDto | null>(null)` for the fetched stats data.
- `useState<boolean>(false)` for loading state during fetches.
- `useState<string | null>(null)` for error messages.

A custom hook `useApplicationStats` is required to encapsulate the fetching logic:

- Purpose: Fetches stats from `/api/applications/stats` on mount, provides refetch, and manages loading/error states.
- Implementation: Use `useEffect` for initial fetch, `useCallback` for refetch function. Returns `{ data: ApplicationStatsDto | null, loading: boolean, error: string | null, refetch: () => Promise<void> }`.
- Usage: In StatsView, destructure the hook's return value; derive StatsItem[] from data?.stats by Object.entries(stats).map(([status, count]) => ({ status: status as ApplicationStatus, label: statusLabels[status as ApplicationStatus], count })) if data exists.

No global state needed for MVP; local state suffices for this read-only view.

## 7. API Integration

Integrate with the new GET `/api/applications/stats` endpoint (to be implemented in backend using ApplicationService to query counts by status for the user).

- Request: No body or query params; use `fetch('/api/applications/stats', { method: 'GET' })`.
- Response Type: `ApplicationStatsDto` - parsed from JSON, validated against the interface (e.g., check if stats has all keys, total matches sum).
- Handling: In `useApplicationStats` hook, use `try-catch` around fetch; on success (200), set data; on error (401/500), set error message (e.g., "Failed to load statistics" for 500, "Unauthorized" for 401). Assume hardcoded user auth for MVP.

## 8. User Interactions

- Navigation to `/stats`: Triggers page load, automatically fetches stats via `useEffect` in the custom hook, displays loading spinner until data arrives. If successful, renders TotalDisplay and StatsGrid with counts; if error, shows error message with retry option via RefreshButton.
- Click RefreshButton: Calls refetch function, sets loading to true, updates display on success or shows updated error. Button disabled during loading.
- Keyboard/Screen Reader: Tab navigation to RefreshButton; aria-live for updates (e.g., announce "Statistics refreshed"); semantic HTML (h1 for title, role="grid" for StatsGrid).
- Responsive: On mobile, grid stacks vertically; large fonts ensure readability.
- Expected Outcomes: Immediate visual feedback (loading -> data or error); data persists on re-render; no destructive actions.

## 9. Conditions and Validation

- API Response Validation (in StatsView/useApplicationStats): Check if response.status === 200; parse JSON and ensure it's ApplicationStatsDto (all statuses present in stats with number values >= 0, total is integer >= 0 and equals sum of stats values). If invalid, set error "Invalid data format".
- Component-Level: In StatsGrid, validate StatsItem[] length === 6 and each count >= 0 before rendering; skip or show 0 for missing. TotalDisplay checks total >= 0. Affects UI: Hide grid if error, show skeleton/loading if loading, disable RefreshButton if loading.
- User Data Scope: API handles user-specific data (via hardcoded DEFAULT_USER_ID); frontend trusts API, no additional client-side filtering.
- Accessibility Conditions: All cards have aria-labels; grid has role="grid"; colors meet WCAG contrast (Tailwind defaults).

## 10. Error Handling

- Network/API Errors: Catch fetch errors or non-200 status; set error state with user-friendly message (e.g., "Unable to load statistics. Please check your connection." for network, "Server error. Try refreshing." for 500). Display inline below title or as toast (using sonner.tsx if integrated).
- Unauthorized (401): Show "Please log in to view statistics" – but for MVP with hardcoded user, treat as 500.
- Invalid Data: If stats missing keys or non-numeric, default to { all: 0, total: 0 } and log warning; avoid crashing.
- Edge Cases: Empty data (all 0s) – show grid with zeros and total 0; no internet – offline message.
- Retry Mechanism: RefreshButton always available for retry; optional auto-retry on error after 5s (debounced).
- Logging: Console.error with error details (status, message) for debugging; no user exposure to technical details.
- Graceful Degradation: If JS disabled, show static message "Enable JavaScript for statistics"; but Astro handles SSR minimally.

## 11. Implementation Steps

1. Create the Astro page: Add `src/pages/stats.astro` using MainLayout, import and render `<StatsView client:load />`.

2. Implement custom hook: Create `src/hooks/useApplicationStats.ts`; use `useState`, `useEffect`, `useCallback`; fetch from `/api/applications/stats`; return data, loading, error, refetch. Handle JSON parse and basic validation.

3. Create StatsView component: In `src/components/StatsView.tsx`; use the hook; derive StatsItem[] from data; render layout with Tailwind (e.g., max-w-4xl mx-auto p-4); conditional render loading (spinner), error (div with message + button), or success (TotalDisplay, RefreshButton, StatsGrid).

4. Implement sub-components:
   - RefreshButton: Reuse ui/button; onClick={refetch}; disabled={loading}.
   - TotalDisplay: Simple div with total prop.
   - StatsGrid: div grid; map StatsItem to StatusCard.
   - StatusCard: Card div with label and count; use statusLabels for Polish text.

5. Add types: If needed, extend `src/types.ts` with StatsItem interface.

6. Styling and Accessibility: Apply Tailwind classes for responsive grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3); add aria-labels, role="grid"; ensure large text (text-xl for labels, text-3xl for counts).

7. Testing: Manually test fetch success/error; verify grid renders 6 cards; check responsive on mobile; screen reader (e.g., VoiceOver) announces correctly.

8. Integration: Add nav link "Statystyki" to MainLayout.astro (separate task if needed). Ensure real-time feel by refetch on window focus (add useEffect for visibilitychange).

9. Edge Cases: Test with mock data (all 0s, partial stats); simulate network error.

10. Cleanup: Export components; ensure no memory leaks in hook (cleanup fetch if abortable).
