# API Endpoint Implementation Plan: Delete Application (Simplified for Development)

## 1. Endpoint Overview

This endpoint allows deletion of a specific job application record using a hardcoded user ID for development and testing purposes. It targets the applications table in Supabase, ensuring the deletion is restricted to applications owned by the DEFAULT_USER_ID. The operation is idempotent and returns no content on success, following RESTful principles for delete actions. This simplified version supports the JobHop MVP development by enabling quick testing without full authentication setup. In production, replace with proper Supabase auth.

## 2. Request Details

- HTTP Method: DELETE
- URL Structure: `/api/applications/{id}` (dynamic route where `{id}` is a UUID)
- Parameters:
    - Required: `id` (path parameter, string in UUID format, e.g., "123e4567-e89b-12d3-a456-426614174000")
    - Optional: None
- Request Body: None (empty JSON or no body expected)

## 3. Used Types

- **DeleteApplicationCommand** (new, add to src/types.ts):  
  ```typescript
  export type DeleteApplicationCommand = {
    id: string;  // UUID of the application to delete
    user_id: string;  // Hardcoded DEFAULT_USER_ID for development
  };
  ```
- **DeleteApplicationCommandSchema** (new Zod schema in src/types.ts for validation):  
  ```typescript
  export const DeleteApplicationCommandSchema = z.object({
    id: z.string().uuid("Invalid application ID format"),
    user_id: z.string().uuid("Invalid user ID format"),
  });
  ```
- **ApiErrorResponse** (existing from src/types.ts): Used for error responses, e.g., `{ error: "Application not found" }`.
- **ApplicationEntity** (existing from src/types.ts): Internal reference for DB schema during ownership verification.
- No response DTO needed due to empty 204 response.

## 4. Response Details

- Success: 204 No Content (empty body, no JSON returned)
- Errors:
  - 400 Bad Request: Invalid input (e.g., malformed UUID), body: `{ error: "Invalid application ID format" }`
  - 403 Forbidden: User attempts to delete non-owned application (though prevented by query filter), body: `{ error: "Forbidden: Not your application" }`
  - 404 Not Found: Application does not exist or not owned by user, body: `{ error: "Application not found" }`
  - 500 Internal Server Error: Server-side issues (e.g., database failure), body: `{ error: "Internal server error" }` (detailed logs internally)

Note: 401 Unauthorized removed for this development version; implement proper auth later.

## 5. Data Flow

1. Incoming DELETE request hits the Astro API route (src/pages/api/applications/[id].ts).
2. Extract `id` from params.
3. Validate `id` as UUID using Zod; set user_id to hardcoded DEFAULT_USER_ID from src/db/supabase.client.ts.
4. Build command with validated id and hardcoded user_id.
5. Invoke `applicationService.deleteApplication(command)` from src/lib/services/application.service.ts:
   - Query Supabase: `supabase.from('applications').delete().eq('id', command.id).eq('user_id', command.user_id).throwOnError()`.
   - Check affected rows: if 0, throw custom NotFoundError.
6. On success, return 204. On error, map to appropriate HTTP status and response.
7. No external services beyond Supabase; uses environment variables via import.meta.env for Supabase config (per Astro rules).
8. Hybrid rendering not applicable (server-side API route with `export const prerender = false`).

## 6. Security Considerations

- **Authentication**: Temporarily bypassed; uses hardcoded DEFAULT_USER_ID from src/db/supabase.client.ts for development/testing. This allows quick iteration but is insecure for production.
- **Authorization**: Enforce ownership by filtering Supabase query with `.eq('user_id', DEFAULT_USER_ID)`. Rely on Supabase Row Level Security (RLS) policies for applications table (e.g., users can only delete own rows). Manual check in service for additional safety.
- **Input Validation**: Zod for UUID sanitization to prevent injection; no body, so no additional parsing risks.
- **Threat Mitigation**: Prevent IDOR by user_id filter; use HTTPS (Astro default in production). No sensitive data in responses. This setup is for dev only—implement full Supabase auth (getUser()) before production to handle real user sessions. Rate limiting via Supabase edge functions if high traffic expected. Follow backend rules: use locals.supabase, Zod validation, and avoid direct Supabase client imports in routes.
- **Auditing**: Log delete attempts (success/failure) with DEFAULT_USER_ID for development compliance testing.

## 7. Performance Considerations

- **Bottlenecks**: Single-row delete query is O(1) with UUID indexing on applications.id and user_id (Supabase defaults). Minimal data transfer (no body/response body).
- **Optimizations**: Use Supabase's direct delete without selects (avoids unnecessary fetches). Cache nothing, as it's a mutating operation. For high-volume users, monitor Supabase query performance; consider batch deletes if feature expands.
- **Scalability**: Server-side rendering in Astro handles concurrent requests efficiently. No N+1 queries. If user has thousands of applications, ownership filter remains fast due to indexes.
- **Monitoring**: Track delete success rates in Supabase logs; aim for <50ms response time.

## 8. Implementation Steps

1. **Update Types**: Add `DeleteApplicationCommand` and `DeleteApplicationCommandSchema` to src/types.ts. Ensure Zod import is present. Export a custom `NotFoundError` class extending Error if needed for service throws. Define DEFAULT_USER_ID in src/db/supabase.client.ts if not present (e.g., const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';).

2. **Enhance Service Layer**: In src/lib/services/application.service.ts, add `async deleteApplication(command: DeleteApplicationCommand): Promise<void>`. Implement Zod validation on command, then Supabase delete query with dual eq filters. Throw NotFoundError if `{ data, error } = await supabase...; if (!data || data.length === 0) throw new NotFoundError();`. Handle Supabase errors early with guard clauses. Inject Supabase client as parameter (per rules).

3. **Create API Route**: Create src/pages/api/applications/[id].ts (dynamic route). Add `export const prerender = false;`. Implement DELETE handler: Extract params.id and locals.supabase. Set user_id = DEFAULT_USER_ID (import from '../db/supabase.client'). Validate id with Zod (catch 400). Build command, call service.deleteApplication(command). On success, return new Response(null, { status: 204 }). Wrap in try-catch: Map NotFoundError to 404, validation errors to 400, others to 500 with ApiErrorResponse JSON. No auth checks needed for dev.

4. **Error Logging**: In service and route, use console.error for 500 errors with structured payload (e.g., JSON.stringify({ endpoint: 'DELETE /api/applications/{id}', error: err, timestamp: new Date() })). For 4xx, log minimally without user details.

5. **Testing Setup**: Add unit tests for service (mock Supabase with DEFAULT_USER_ID, test ownership filter, rowCount=0). Integration tests for route (valid/invalid UUIDs using hardcoded user). Verify RLS policies in Supabase dashboard, ensuring they work with DEFAULT_USER_ID.

6. **Documentation Update**: Update .ai/api-plan.md with any refinements (e.g., note dev-only hardcoded user). Ensure types.ts and supabase.client.ts reflect changes. Document that full auth needs implementation for production.

7. **Deployment Notes**: Test in dev with Supabase local using DEFAULT_USER_ID; ensure env vars (SUPABASE_URL, SUPABASE_ANON_KEY) are set. Monitor for cascade deletes if user account is removed (per DB schema). Replace hardcoded user with proper auth before production deployment.
