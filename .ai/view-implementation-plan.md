# API Endpoint Implementation Plan: GET /api/applications

## 1. Endpoint Overview

This endpoint retrieves a paginated list of all job applications, sorted by creation date in descending order (newest first). It supports optional filtering by application status to allow viewing specific subsets of applications (e.g., only "in_progress" ones). The purpose is to power the dashboard or list views in the JobHop application, providing an overview of job search progress. It adheres to REST principles, using GET for read-only access, and leverages Supabase for secure data retrieval. Access is limited to authenticated users via Supabase, but applications are not scoped to individual users at this stage.

## 2. Request Details

- HTTP Method: GET
- URL Structure: `/api/applications`
- Parameters:
    - Required: None
    - Optional:
        - `status` (string, enum: 'planned'|'sent'|'in_progress'|'interview'|'rejected'|'offer') - Filters applications to those matching the specified status.
        - `page` (integer, default: 1) - Specifies the page number for pagination (must be >= 1).
        - `limit` (integer, default: 20, max: 100) - Specifies the number of applications to return per page.
- Request Body: None (as this is a GET request)

## 3. Used Types

- **DTOs**:
  - `ApplicationDto`: Represents individual application data in the response (picks id, company_name, position_name, application_date, link, notes, status, created_at, updated_at from ApplicationEntity).
  - `PaginationDto`: Contains pagination metadata (total: number, page: number, limit: number).
  - `ApplicationListResponseDto`: Full response structure { applications: ApplicationDto[], pagination: PaginationDto }.

- **Command Models**: None required, as this endpoint does not involve data creation or updates.

- **Additional Types**:
  - `ApplicationStatus`: Enum for status validation (from Enums<"application_status">).
  - Zod schemas for query validation (custom schema to be defined in the route).

## 4. Response Details

- **Success Response**:
  - Status Code: 200 OK
  - Body: JSON object conforming to `ApplicationListResponseDto`:
    ```json
    {
      "applications": [
        {
          "id": "uuid-string",
          "company_name": "Example Company",
          "position_name": "Software Engineer",
          "application_date": "2025-11-03",
          "link": "https://example.com/job/123",
          "notes": "Followed up via email",
          "status": "sent",
          "created_at": "2025-11-03T10:00:00Z",
          "updated_at": "2025-11-03T10:00:00Z"
        }
      ],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 20
      }
    }
    ```
    - If no applications match: Empty `applications` array with accurate `pagination.total` (e.g., 0).

- **Error Responses**:
  - 400 Bad Request: `{ "error": "Invalid query parameters." }` (e.g., invalid status or limit > 100).
  - 401 Unauthorized: `{ "error": "Authentication required." }`.
  - 500 Internal Server Error: `{ "error": "Internal server error." }` (generic for unexpected failures).

## 5. Data Flow

1. **Request Reception**: Astro API route (`src/pages/api/applications.astro`) receives the GET request and extracts query parameters from `Astro.url.searchParams`.
2. **Authentication**: Access Supabase client from `context.locals` (per backend rules). Verify the user's session using `supabase.auth.getUser()` to ensure authentication. If no valid session, return 401.
3. **Input Validation**: Parse and validate query params using Zod schema. Refine defaults (page=1, limit=20) and enforce constraints (e.g., limit <=100). If invalid, return 400.
4. **Service Invocation**: Call `ApplicationService.getApplications({ status?, page, limit })` from `src/lib/services/ApplicationService.ts`. This service:
   - Builds a Supabase query on the `applications` table without user-specific filtering.
   - Applies optional `status` filter with `eq('status', status)`.
   - Applies sorting with `order('created_at', { ascending: false })`.
   - Implements pagination using `range((page-1)*limit, page*limit - 1)`.
   - Executes `supabase.from('applications').select('*')` with filters, retrieves count via separate `select('count', { count: 'exact', head: true })` query for total.
   - Maps results to `ApplicationDto[]` (excluding sensitive fields like user_id).
5. **Response Construction**: Build `ApplicationListResponseDto` from service results and return as JSON via `Astro.response.json()`.
6. **Database Interaction**: All queries use Supabase SDK for type-safe, secure access. No per-user scoping is applied at this stage.

## 6. Security Considerations

- **Authentication**: Mandatory via Supabase Auth. Use `Astro.locals.supabase` to get the session and verify authentication with `supabase.auth.getUser()`. Reject unauthenticated requests with 401.
- **Authorization**: No user-specific authorization or scoping is implemented at this time; the endpoint returns all applications visible to authenticated users. Future enhancements can add per-user filtering.
- **Input Validation**: Zod schema prevents injection (e.g., validates enum for status, sanitizes numbers). No user-controlled SQL; Supabase SDK parameterizes queries.
- **Data Exposure**: Response uses `ApplicationDto` to omit `user_id` and other internal fields. Links and notes are user-provided but not executable (no HTML/JS rendering assumed in API).
- **Other Threats**: Implement rate limiting at the Supabase level or via middleware if high traffic expected. Use HTTPS for all requests (Astro handles via deployment). No CSRF risk for GET API calls.

## 7. Performance Considerations

- **Pagination**: Essential for large datasets; limit max to 100 prevents overload. Use Supabase's `range` for efficient offset-based pagination (note: for very large offsets, consider cursor-based if scaled).
- **Query Optimization**: Index `applications` table on `(status, created_at DESC)` for fast filtering/sorting. Separate count query avoids over-fetching.
- **Caching**: For frequently accessed lists, consider Supabase Edge Function caching or Astro's built-in SSR caching if patterns emerge (e.g., cache by status for 5-10 minutes).
- **Bottlenecks**: Supabase query latency for large tables; monitor with Supabase dashboard. Avoid N+1 queries by batching select and count. Response size limited by pagination (max ~100 items * ~500 bytes/item = 50KB).
- **Scalability**: As applications grow (>10k), migrate to cursor pagination. Use Supabase connection pooling implicitly via SDK.

## 8. Implementation Steps

1. **Create ApplicationService**: In `src/lib/services/ApplicationService.ts`, define a class or module with `async getApplications(filters: { status?: ApplicationStatus; page: number; limit: number })`. Implement Supabase query logic: apply status if provided, sort by created_at DESC, paginate with range, fetch count separately, map to DTOs. Handle errors with try-catch, throwing custom errors if needed. Export type-safe function using SupabaseClient from `src/db/supabase.client.ts`.

2. **Set Up API Route**: Create or update `src/pages/api/applications.astro`. Add `export const prerender = false;` for dynamic rendering. In the GET handler: Extract and validate query params with Zod (define schema: z.object({ status: z.enum(validStatuses).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).parse(Object.fromEntries(Astro.url.searchParams))). Verify authentication via `Astro.locals.supabase.auth.getUser()`. If not authenticated, return 401 JSON.

3. **Implement Validation and Auth Guard**: In the route, after Zod parse, use `isValidApplicationStatus(filters.status)` from types.ts for extra enum check. Wrap service call in try-catch: On validation/service error, log to console.error({ error, timestamp: new Date() }) and return 400/500 as appropriate.

4. **Build Response**: Call service, construct `ApplicationListResponseDto` { applications: results.data?.map(toDto) || [], pagination: { total: count.data?.[0].count || 0, page: filters.page, limit: filters.limit } }. Return `new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })`.

5. **Error Handling Integration**: Define a helper function for error responses (e.g., `createErrorResponse(status, message)`). In service, rethrow Supabase errors (e.g., if !result.data, throw new Error('Query failed')). Ensure early returns for guards (auth failure, invalid input) per clean code rules.

6. **Database Setup**: Ensure the `applications` table is accessible via Supabase. No RLS per-user policies are required at this stage.

7. **Documentation Update**: Update API docs in `.ai/api-plan.md` if changes made. Ensure types.ts aligns (no changes needed). Deploy and monitor Supabase query performance.
