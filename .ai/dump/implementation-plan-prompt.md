Me: 
You are an experienced software architect whose task is to create a detailed implementation plan for a REST API endpoint. Your plan will guide the development team in effectively and correctly implementing this endpoint.

Before we begin, review the following information:

1. Route API specification:
   <route_api_specification>
   @api-plan.md (12-43) 
   </route_api_specification>

2. Related database resources:
   <related_db_resources>
   applications: id (UUID PRIMARY KEY), user_id (UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE), company_name (VARCHAR(255) NOT NULL), position_name (VARCHAR(255) NOT NULL), application_date (DATE NOT NULL), link (TEXT NULL), notes (TEXT NULL), status (ENUM('planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer') NOT NULL), created_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP), updated_at (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP).

Jeden-do-wielu: auth.users (1) → applications (N) poprzez user_id. Zapewnia, że aplikacje są powiązane z użytkownikiem; kaskadowe usuwanie przy usuwaniu użytkownika (poprzez trigger w Supabase).

   </related_db_resources>

3. Type definitions:
   <type_definitions>
  @types.ts 
   </type_definitions>

3. Tech stack:
   <tech_stack>
   @tech-stack.md 
   </tech_stack>

4. Implementation rules:
   <implementation_rules>
@shared.mdc @astro.mdc @backend.mdc 
   </implementation_rules>

Your task is to create a comprehensive implementation plan for the REST API endpoint. Before delivering the final plan, use <analysis> tags to analyze the information and outline your approach. In this analysis, ensure that:

1. Summarize key points of the API specification.
2. List required and optional parameters from the API specification.
3. List necessary DTO types and Command Models.
4. Consider how to extract logic to a service (existing or new, if it doesn't exist).
5. Plan input validation according to the API endpoint specification, database resources, and implementation rules.
6. Determine how to log errors in the error table (if applicable).
7. Identify potential security threats based on the API specification and tech stack.
8. Outline potential error scenarios and corresponding status codes.

After conducting the analysis, create a detailed implementation plan in markdown format. The plan should contain the following sections:

1. Endpoint Overview
2. Request Details
3. Response Details
4. Data Flow
5. Security Considerations
6. Error Handling
7. Performance
8. Implementation Steps

Throughout the plan, ensure that you:
- Use correct API status codes:
    - 200 for successful read
    - 201 for successful creation
    - 400 for invalid input
    - 401 for unauthorized access
    - 404 for not found resources
    - 500 for server-side errors
- Adapt to the provided tech stack
- Follow the provided implementation rules

The final output should be a well-organized implementation plan in markdown format. Here's an example of what the output should look like:

``markdown
# API Endpoint Implementation Plan: [Endpoint Name]

## 1. Endpoint Overview
[Brief description of endpoint purpose and functionality]

## 2. Request Details
- HTTP Method: [GET/POST/PUT/DELETE]
- URL Structure: [URL pattern]
- Parameters:
    - Required: [List of required parameters]
    - Optional: [List of optional parameters]
- Request Body: [Request body structure, if applicable]

## 3. Used Types
[DTOs and Command Models necessary for implementation]

## 3. Response Details
[Expected response structure and status codes]

## 4. Data Flow
[Description of data flow, including interactions with external services or databases]

## 5. Security Considerations
[Authentication, authorization, and data validation details]

## 6. Error Handling
[List of potential errors and how to handle them]

## 7. Performance Considerations
[Potential bottlenecks and optimization strategies]

## 8. Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
   ...
```

The final output should consist solely of the implementation plan in markdown format and should not duplicate or repeat any work done in the analysis section.

Remember to save your implementation plan as .ai/view-implementation-plan.md. Ensure the plan is detailed, clear, and provides comprehensive guidance for the development team.



Agent:
<analysis>
Summarize key points of the API specification: The endpoint is a GET request to /api/applications, designed to retrieve a paginated list of the authenticated user's job applications, sorted by created_at in descending order. It supports optional filtering by application status. The response includes an array of application details and pagination metadata (total count, current page, limit). No request body is required. Success returns 200 OK with the structured JSON; errors include 401 for unauthorized access.
List required and optional parameters: No required parameters. Optional query parameters: - status (string, enum: 'planned'|'sent'|'in_progress'|'interview'|'rejected'|'offer') for filtering applications by status. - page (integer, default 1) for pagination offset. - limit (integer, default 20, maximum 100) for number of items per page.
List necessary DTO types and Command Models: DTOs: ApplicationListResponseDto (for the full response), ApplicationDto (for each application in the list), PaginationDto (for pagination info). No Command Models are needed as this is a read-only GET endpoint with no request body modifications.
Consider how to extract logic to a service: Create a new service if it doesn't exist: src/lib/services/ApplicationService.ts. This service will handle the business logic for querying applications from Supabase, including user-specific filtering, status filtering, pagination, and sorting. The API route will import and call methods like getApplications(userId, filters) from this service to keep the route handler thin and focused on HTTP concerns.
Plan input validation: Use Zod in the API route to validate query parameters: Define a schema with z.string().optional() for status (refined with enum validation), z.number().int().min(1).optional() for page (default 1), z.number().int().min(1).max(100).optional() for limit (default 20). Parse the URL search params with this schema; on failure, return 400 Bad Request with a user-friendly error message. Additionally, ensure status is validated against the ApplicationStatus enum from types.ts.
Determine how to log errors in the error table: No specific error table is mentioned in the provided resources or rules. Follow general implementation rules for proper error logging: Use console.error for server-side errors in development, and consider integrating Supabase's logging or a custom log table in production if expanded later. For now, log errors to console with structured data (e.g., error message, userId, timestamp) before returning 500 responses. Do not assume an error table exists.
Identify potential security threats: - Unauthorized access: Ensure authentication via Supabase and verify the requesting user's ID matches the applications' user_id. - Data exposure: Row Level Security (RLS) should be enabled on the applications table to restrict queries to the authenticated user; fallback to manual user_id filtering in the service. - Injection attacks: Use Supabase's parameterized queries (inherent in the SDK) and Zod validation to prevent SQL injection or invalid enum values. - Rate limiting: Potential DoS from excessive pagination requests; implement Supabase query limits or API-level throttling if needed. - Information disclosure: Avoid leaking other users' data by strictly scoping queries to the authenticated user_id.
Outline potential error scenarios and corresponding status codes: - Invalid query parameters (e.g., invalid status enum, page < 1, limit > 100): 400 Bad Request with error message like "Invalid query parameters." - No authentication or invalid session: 401 Unauthorized with "Authentication required." - No applications found for the user (empty list): 200 OK with empty array (not an error). - Database query failure (e.g., Supabase connection issue): 500 Internal Server Error with generic message. - Server-side logic error (e.g., service failure): 500 Internal Server Error. - Unauthorized access to another user's data (should be prevented by auth): 401 Unauthorized.
</analysis>
API Endpoint Implementation Plan: GET /api/applications
1. Endpoint Overview
This endpoint retrieves a paginated list of job applications belonging to the authenticated user, sorted by creation date in descending order (newest first). It supports optional filtering by application status to allow users to view specific subsets of their applications (e.g., only "in_progress" ones). The purpose is to power the dashboard or list views in the JobHop application, providing users with an organized overview of their job search progress. It adheres to REST principles, using GET for read-only access, and leverages Supabase for secure, user-scoped data retrieval.
2. Request Details
HTTP Method: GET
URL Structure: /api/applications
Parameters:
Required: None
Optional:
status (string, enum: 'planned'|'sent'|'in_progress'|'interview'|'rejected'|'offer') - Filters applications to those matching the specified status.
page (integer, default: 1) - Specifies the page number for pagination (must be >= 1).
limit (integer, default: 20, max: 100) - Specifies the number of applications to return per page.
Request Body: None (as this is a GET request)
3. Used Types
DTOs:
ApplicationDto: Represents individual application data in the response (picks id, company_name, position_name, application_date, link, notes, status, created_at, updated_at from ApplicationEntity).
PaginationDto: Contains pagination metadata (total: number, page: number, limit: number).
ApplicationListResponseDto: Full response structure { applications: ApplicationDto[], pagination: PaginationDto }.
Command Models: None required, as this endpoint does not involve data creation or updates.
Additional Types:
ApplicationStatus: Enum for status validation (from Enums<"application_status">).
Zod schemas for query validation (custom schema to be defined in the route).
4. Response Details
Success Response:
Status Code: 200 OK
Body: JSON object conforming to ApplicationListResponseDto:
    {      "applications": [        {          "id": "uuid-string",          "company_name": "Example Company",          "position_name": "Software Engineer",          "application_date": "2025-11-03",          "link": "https://example.com/job/123",          "notes": "Followed up via email",          "status": "sent",          "created_at": "2025-11-03T10:00:00Z",          "updated_at": "2025-11-03T10:00:00Z"        }      ],      "pagination": {        "total": 50,        "page": 1,        "limit": 20      }    }    ```    - If no applications match: Empty `applications` array with accurate `pagination.total` (e.g., 0).- **Error Responses**:  - 400 Bad Request: `{ "error": "Invalid query parameters." }` (e.g., invalid status or limit > 100).  - 401 Unauthorized: `{ "error": "Authentication required." }`.  - 500 Internal Server Error: `{ "error": "Internal server error." }` (generic for unexpected failures).## 5. Data Flow1. **Request Reception**: Astro API route (`src/pages/api/applications.astro`) receives the GET request and extracts query parameters from `Astro.url.searchParams`.2. **Authentication**: Access Supabase client from `context.locals` (per backend rules). Verify the user's session using `supabase.auth.getUser()` to obtain the authenticated `userId`. If no valid session, return 401.3. **Input Validation**: Parse and validate query params using Zod schema. Refine defaults (page=1, limit=20) and enforce constraints (e.g., limit <=100). If invalid, return 400.4. **Service Invocation**: Call `ApplicationService.getApplications(userId, { status?, page, limit })` from `src/lib/services/ApplicationService.ts`. This service:   - Builds a Supabase query on the `applications` table, filtering by `user_id = userId` (ensuring user isolation).   - Applies optional `status` filter with `eq('status', status)`.   - Applies sorting with `order('created_at', { ascending: false })`.   - Implements pagination using `range((page-1)*limit, page*limit - 1)`.   - Executes `supabase.from('applications').select('*')` with filters, retrieves count via separate `select('count', { count: 'exact', head: true })` query for total.   - Maps results to `ApplicationDto[]` (excluding sensitive fields like user_id).5. **Response Construction**: Build `ApplicationListResponseDto` from service results and return as JSON via `Astro.response.json()`.6. **Database Interaction**: All queries use Supabase SDK for type-safe, secure access. Rely on RLS policies on `applications` table to enforce user_id scoping (SELECT policy: auth.uid() = user_id).## 6. Security Considerations- **Authentication**: Mandatory via Supabase Auth. Use `Astro.locals.supabase` to get the session and extract `userId` from `event.locals.getSession()?.user.id`. Reject unauthenticated requests with 401.- **Authorization**: Scope all queries to the authenticated `userId` using `eq('user_id', userId)` in Supabase filters. Enable and verify RLS policy on `applications` table: `CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);`. This prevents data leakage across users.- **Input Validation**: Zod schema prevents injection (e.g., validates enum for status, sanitizes numbers). No user-controlled SQL; Supabase SDK parameterizes queries.- **Data Exposure**: Response uses `ApplicationDto` to omit `user_id` and other internal fields. Links and notes are user-provided but not executable (no HTML/JS rendering assumed in API).- **Other Threats**: Implement rate limiting at the Supabase level or via middleware if high traffic expected. Use HTTPS for all requests (Astro handles via deployment). No CSRF risk for GET API calls.## 7. Performance Considerations- **Pagination**: Essential for large user datasets; limit max to 100 prevents overload. Use Supabase's `range` for efficient offset-based pagination (note: for very large offsets, consider cursor-based if scaled).- **Query Optimization**: Index `applications` table on `(user_id, status, created_at DESC)` for fast filtering/sorting. Separate count query avoids over-fetching.- **Caching**: For frequently accessed lists, consider Supabase Edge Function caching or Astro's built-in SSR caching if patterns emerge (e.g., cache by userId + status for 5-10 minutes).- **Bottlenecks**: Supabase query latency for large tables; monitor with Supabase dashboard. Avoid N+1 queries by batching select and count. Response size limited by pagination (max ~100 items * ~500 bytes/item = 50KB).- **Scalability**: As user applications grow (>10k), migrate to cursor pagination. Use Supabase connection pooling implicitly via SDK.## 8. Implementation Steps1. **Create ApplicationService**: In `src/lib/services/ApplicationService.ts`, define a class or module with `async getApplications(userId: string, filters: { status?: ApplicationStatus; page: number; limit: number })`. Implement Supabase query logic: filter by user_id, apply status if provided, sort by created_at DESC, paginate with range, fetch count separately, map to DTOs. Handle errors with try-catch, throwing custom errors if needed. Export type-safe function using SupabaseClient from `src/db/supabase.client.ts`.2. **Set Up API Route**: Create or update `src/pages/api/applications.astro`. Add `export const prerender = false;` for dynamic rendering. In the GET handler: Extract and validate query params with Zod (define schema: z.object({ status: z.enum(validStatuses).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).parse(Object.fromEntries(Astro.url.searchParams))). Get userId from auth session via `Astro.locals.supabase.auth.getUser()`. If no user, return 401 JSON.3. **Implement Validation and Auth Guard**: In the route, after Zod parse, use `isValidApplicationStatus(filters.status)` from types.ts for extra enum check. Wrap service call in try-catch: On validation/service error, log to console.error({ error, userId, timestamp: new Date() }) and return 400/500 as appropriate.4. **Build Response**: Call service, construct `ApplicationListResponseDto` { applications: results.data?.map(toDto) || [], pagination: { total: count.data?.[0].count || 0, page: filters.page, limit: filters.limit } }. Return `new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } })`.5. **Error Handling Integration**: Define a helper function for error responses (e.g., `createErrorResponse(status, message)`). In service, rethrow Supabase errors (e.g., if !result.data, throw new Error('Query failed')). Ensure early returns for guards (auth failure, invalid input) per clean code rules.6. **Database and RLS Setup**: Ensure RLS is enabled on `applications` (via Supabase dashboard or migration). Test query scoping manually in service if RLS not fully covering.7. **Testing and Logging**: Add console logging for errors (structured JSON). Unit test service with mocked Supabase (e.g., @supabase/supabase-js testing utils). Integration test endpoint with authenticated requests. Verify pagination, filtering, and empty states.8. **Documentation Update**: Update API docs in `.ai/api-plan.md` if changes made. Ensure types.ts aligns (no changes needed). Deploy and monitor Supabase query performance.
If no applications match: Empty applications array with accurate pagination.total (e.g., 0).
Error Responses:
400 Bad Request: { "error": "Invalid query parameters." } (e.g., invalid status or limit > 100).
401 Unauthorized: { "error": "Authentication required." }.
500 Internal Server Error: { "error": "Internal server error." } (generic for unexpected failures).
5. Data Flow
Request Reception: Astro API route (src/pages/api/applications.astro) receives the GET request and extracts query parameters from Astro.url.searchParams.
Authentication: Access Supabase client from context.locals (per backend rules). Verify the user's session using supabase.auth.getUser() to obtain the authenticated userId. If no valid session, return 401.
Input Validation: Parse and validate query params using Zod schema. Refine defaults (page=1, limit=20) and enforce constraints (e.g., limit <=100). If invalid, return 400.
Service Invocation: Call ApplicationService.getApplications(userId, { status?, page, limit }) from src/lib/services/ApplicationService.ts. This service:
Builds a Supabase query on the applications table, filtering by user_id = userId (ensuring user isolation).
Applies optional status filter with eq('status', status).
Applies sorting with order('created_at', { ascending: false }).
Implements pagination using range((page-1)*limit, page*limit - 1).
Executes supabase.from('applications').select('*') with filters, retrieves count via separate select('count', { count: 'exact', head: true }) query for total.
Maps results to ApplicationDto[] (excluding sensitive fields like user_id).
Response Construction: Build ApplicationListResponseDto from service results and return as JSON via Astro.response.json().
Database Interaction: All queries use Supabase SDK for type-safe, secure access. Rely on RLS policies on applications table to enforce user_id scoping (SELECT policy: auth.uid() = user_id).
6. Security Considerations
Authentication: Mandatory via Supabase Auth. Use Astro.locals.supabase to get the session and extract userId from event.locals.getSession()?.user.id. Reject unauthenticated requests with 401.
Authorization: Scope all queries to the authenticated userId using eq('user_id', userId) in Supabase filters. Enable and verify RLS policy on applications table: CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);. This prevents data leakage across users.
Input Validation: Zod schema prevents injection (e.g., validates enum for status, sanitizes numbers). No user-controlled SQL; Supabase SDK parameterizes queries.
Data Exposure: Response uses ApplicationDto to omit user_id and other internal fields. Links and notes are user-provided but not executable (no HTML/JS rendering assumed in API).
Other Threats: Implement rate limiting at the Supabase level or via middleware if high traffic expected. Use HTTPS for all requests (Astro handles via deployment). No CSRF risk for GET API calls.
7. Performance Considerations
Pagination: Essential for large user datasets; limit max to 100 prevents overload. Use Supabase's range for efficient offset-based pagination (note: for very large offsets, consider cursor-based if scaled).
Query Optimization: Index applications table on (user_id, status, created_at DESC) for fast filtering/sorting. Separate count query avoids over-fetching.
Caching: For frequently accessed lists, consider Supabase Edge Function caching or Astro's built-in SSR caching if patterns emerge (e.g., cache by userId + status for 5-10 minutes).
Bottlenecks: Supabase query latency for large tables; monitor with Supabase dashboard. Avoid N+1 queries by batching select and count. Response size limited by pagination (max ~100 items * ~500 bytes/item = 50KB).
Scalability: As user applications grow (>10k), migrate to cursor pagination. Use Supabase connection pooling implicitly via SDK.
8. Implementation Steps
Create ApplicationService: In src/lib/services/ApplicationService.ts, define a class or module with async getApplications(userId: string, filters: { status?: ApplicationStatus; page: number; limit: number }). Implement Supabase query logic: filter by user_id, apply status if provided, sort by created_at DESC, paginate with range, fetch count separately, map to DTOs. Handle errors with try-catch, throwing custom errors if needed. Export type-safe function using SupabaseClient from src/db/supabase.client.ts.
Set Up API Route: Create or update src/pages/api/applications.astro. Add export const prerender = false; for dynamic rendering. In the GET handler: Extract and validate query params with Zod (define schema: z.object({ status: z.enum(validStatuses).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }).parse(Object.fromEntries(Astro.url.searchParams))). Get userId from auth session via Astro.locals.supabase.auth.getUser(). If no user, return 401 JSON.
Implement Validation and Auth Guard: In the route, after Zod parse, use isValidApplicationStatus(filters.status) from types.ts for extra enum check. Wrap service call in try-catch: On validation/service error, log to console.error({ error, userId, timestamp: new Date() }) and return 400/500 as appropriate.
Build Response: Call service, construct ApplicationListResponseDto { applications: results.data?.map(toDto) || [], pagination: { total: count.data?.[0].count || 0, page: filters.page, limit: filters.limit } }. Return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } }).
Error Handling Integration: Define a helper function for error responses (e.g., createErrorResponse(status, message)). In service, rethrow Supabase errors (e.g., if !result.data, throw new Error('Query failed')). Ensure early returns for guards (auth failure, invalid input) per clean code rules.
Database and RLS Setup: Ensure RLS is enabled on applications (via Supabase dashboard or migration). Test query scoping manually in service if RLS not fully covering.
Testing and Logging: Add console logging for errors (structured JSON). Unit test service with mocked Supabase (e.g., @supabase/supabase-js testing utils). Integration test endpoint with authenticated requests. Verify pagination, filtering, and empty states.
Documentation Update: Update API docs in .ai/api-plan.md if changes made. Ensure types.ts aligns (no changes needed). Deploy and monitor Supabase query performance.
