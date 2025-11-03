# API Endpoint Implementation Plan: POST /api/applications - Create Application (Simplified with Hardcoded User)

## 1. Endpoint Overview

This endpoint allows users to create a new job application entry in their personal dashboard. It inserts a new record into the `applications` table, associating it with a hardcoded DEFAULT_USER_ID from `src/db/supabase.client.ts` for simplicity in testing and MVP phase. The endpoint ensures data integrity by validating inputs and defaulting the status to 'sent' if not specified. It supports tracking essential application details like company, position, date, and optional notes or links. Note: This bypasses authentication temporarily; real auth integration should be added later.

## 2. Request Details

- HTTP Method: POST
- URL Structure: /api/applications
- Parameters:
    - Required: None (all in body)
    - Optional: None (all in body)
- Request Body:
```json
{
  "company_name": "string (required)",
  "position_name": "string (required)",
  "application_date": "YYYY-MM-DD (required)",
  "link": "string|null (optional)",
  "notes": "string|null (optional)",
  "status": "enum value (optional, default 'sent')"
}
```
The status enum values are: 'planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer'.

## 3. Used Types

- **CreateApplicationRequest** (Zod schema for input validation):
  - company_name: z.string().min(1).max(255)
  - position_name: z.string().min(1).max(255)
  - application_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform((val) => new Date(val))
  - link: z.string().url().nullable().optional()
  - notes: z.string().max(10000).nullable().optional()
  - status: z.enum(['planned', 'sent', 'in_progress', 'interview', 'rejected', 'offer']).default('sent').optional()

- **CreateApplicationCommand** (Internal model for service layer, uses hardcoded user_id):
  - All fields from CreateApplicationRequest
  - user_id: string (hardcoded DEFAULT_USER_ID)

- **ApplicationResponse** (DTO for output, based on DB schema):
  - id: string (UUID)
  - company_name: string
  - position_name: string
  - application_date: string (YYYY-MM-DD)
  - link: string | null
  - notes: string | null
  - status: string (enum)
  - created_at: string (ISO timestamp)
  - updated_at: string (ISO timestamp)

These types should be defined in `src/types.ts` or a dedicated API types file, ensuring type safety with TypeScript.

## 4. Response Details

- Success: 201 Created
  ```json
  {
    "id": "uuid",
    "company_name": "string",
    "position_name": "string",
    "application_date": "YYYY-MM-DD",
    "link": "string|null",
    "notes": "string|null",
    "status": "enum value",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp"
  }
  ```
  Message: "Application added."

- Errors:
  - 400 Bad Request: Invalid input (e.g., missing fields, invalid date, invalid status)
  - 500 Internal Server Error: Database insertion failure or unexpected errors

(Note: 401 Unauthorized removed as auth is bypassed.)

## 5. Data Flow

1. Incoming POST request to `/src/pages/api/applications.ts`.
2. Extract Supabase client from `Astro.locals` (use supabase from context.locals).
3. Parse and validate request body using Zod schema (CreateApplicationRequest).
4. If valid, create CreateApplicationCommand by adding hardcoded DEFAULT_USER_ID as user_id.
5. Call service layer: `applicationsService.create(command)` in `src/lib/services/applications.service.ts`.
6. In service: Use Supabase client to insert into `applications` table with the fixed user_id (RLS policies should allow inserts for this user or be disabled temporarily).
7. On success, fetch the inserted record (or return from insert response) and map to ApplicationResponse.
8. Return 201 with JSON response.
9. On failure, log error (console.error or Supabase logs) and return appropriate error response.

No external services beyond Supabase; hybrid rendering not applicable for API route (set `prerender = false`).

## 6. Security Considerations

- **Authentication**: Bypassed temporarily; using hardcoded DEFAULT_USER_ID ("84874bca-dd20-420e-b0ff-fced57a14167") from `src/db/supabase.client.ts`. This is for development/testing only; implement full Supabase Auth later.
- **Authorization**: Inserts use fixed user_id; ensure Supabase RLS policies allow inserts for this user_id (e.g., disable RLS or create permissive policy for MVP). The one-to-many relation ensures cascade delete on user removal.
- **Input Validation**: Zod for schema validation; sanitize strings to prevent XSS (though Supabase handles SQL injection). Validate date format and enum values strictly.
- **Potential Threats**:
  - Unauthorized access: Currently open; mitigate by adding auth before production.
  - Data tampering: Fixed user_id limits to one user; RLS should still enforce if enabled.
  - Injection attacks: Supabase parameters prevent SQLi; Zod prevents malformed data.
  - Rate limiting: Consider adding later for abuse prevention.
- Use HTTPS in production; no sensitive data in logs. Revert to proper auth to secure multi-user access.

## 7. Performance Considerations

- Simple single-row insert: Low latency (<100ms expected).
- Potential Bottlenecks: Supabase connection pooling (handled by Astro integration); validation overhead (minimal with Zod).
- Optimizations: Use direct insert without unnecessary selects; index on user_id and application_date for future queries. Avoid N+1 queries (none here). For high traffic, consider caching (not needed for create).
- Scalability: Supabase scales automatically; monitor query performance via Supabase dashboard. Hardcoded user simplifies but limits to single-user testing.

## 8. Implementation Steps

1. Define Zod schemas and TypeScript types for CreateApplicationRequest, CreateApplicationCommand, and ApplicationResponse in `src/types.ts` (or `src/lib/types/api.ts`). In CreateApplicationCommand, note user_id is hardcoded.

2. Create or update `src/lib/services/applications.service.ts` with `createApplication` function:
   - Input: CreateApplicationCommand
   - Use Supabase client to insert: `supabase.from('applications').insert({...}).select().single()`
   - Handle errors with try-catch; throw custom errors if needed.
   - Ensure early returns for invalid states (e.g., invalid date after transform).

3. In `src/pages/api/applications.ts`:
   - Set `export const prerender = false;`
   - Define POST handler: `export const POST = async ({ locals, request }) => { ... }`
   - Get supabase: `const supabase = locals.supabase;`
   - Import DEFAULT_USER_ID: `import { DEFAULT_USER_ID } from '../../db/supabase.client';`
   - Parse body: `const body = await request.json();`
   - Validate: `const validated = createApplicationSchema.parse(body);`
   - Prepare command: `{ ...validated, user_id: DEFAULT_USER_ID }`
   - Call service: `const result = await applicationsService.create(command);`
   - Return: `return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } });`

4. Implement error handling:
   - Zod validation errors: 400 with error details (safe fields only).
   - Supabase errors: 500 with generic message; log full error (console.error).
   - Use guard clauses: Check validation first, then DB op.
   - No unnecessary else; early returns.

5. Ensure Supabase RLS allows inserts for DEFAULT_USER_ID (temporarily disable RLS on applications table if needed for MVP).

6. Test endpoint: Manually via curl with valid/invalid inputs.

7. Log errors: Use `console.error` for development; integrate with Supabase logs or error service for production. No dedicated error table mentioned, so standard logging suffices.

8. Update API documentation if needed (e.g., in .ai/api-plan.md) after implementation. Plan to add authentication in a future step.
