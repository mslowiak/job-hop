# REST API Plan

## 1. Resources

- **Applications**: Corresponds to the `applications` table in the database. This resource manages job applications for authenticated users, including CRUD operations, filtering, sorting, and statistics. All operations are scoped to the authenticated user's data via RLS.
- **Auth/Users**: Managed via Supabase's built-in `auth.users` table. This resource handles user registration, authentication, and account management. Custom API endpoints wrap Supabase auth for consistency, but core auth is handled by Supabase SDK.

## 2. Endpoints

### Auth/Users Resource

- **Method**: POST  
  **Path**: `/api/auth/register`  
  **Description**: Registers a new user account.  
  **Query Parameters**: None  
  **Request JSON Body**:  
  ```json
  {
    "email": "string (required, valid email format)",
    "password": "string (required, min 8 chars)",
    "confirm_password": "string (required, must match password)"
  }
  ```  
  **Response JSON**:  
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "token": "string (JWT)"
  }
  ```  
  **Success Codes/Messages**: 201 Created - "User registered successfully."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Invalid email format or passwords do not match."  
  - 409 Conflict - "Email already registered."  
  - 500 Internal Server Error - "Registration failed."

- **Method**: POST  
  **Path**: `/api/auth/login`  
  **Description**: Authenticates a user and returns a JWT token.  
  **Query Parameters**: None  
  **Request JSON Body**:  
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```  
  **Response JSON**:  
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "token": "string (JWT)"
  }
  ```  
  **Success Codes/Messages**: 200 OK - "Login successful."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Invalid credentials."  
  - 401 Unauthorized - "Authentication failed."  
  - 500 Internal Server Error - "Login error."

- **Method**: POST  
  **Path**: `/api/auth/logout`  
  **Description**: Logs out the user (client discards token; optional server-side invalidation).  
  **Query Parameters**: None  
  **Request JSON Body**: None  
  **Response JSON**: Empty  
  **Success Codes/Messages**: 200 OK - "Logged out successfully."  
  **Error Codes/Messages**:  
  - 401 Unauthorized - "No active session."

- **Method**: PATCH  
  **Path**: `/api/auth/password`  
  **Description**: Changes the user's password. Requires valid JWT.  
  **Query Parameters**: None  
  **Request JSON Body**:  
  ```json
  {
    "old_password": "string (required)",
    "new_password": "string (required, min 8 chars)",
    "confirm_new_password": "string (required, must match new_password)"
  }
  ```  
  **Response JSON**:  
  ```json
  {
    "message": "Password updated successfully."
  }
  ```  
  **Success Codes/Messages**: 200 OK - "Password changed."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Passwords do not match or invalid format."  
  - 401 Unauthorized - "Old password incorrect."  
  - 403 Forbidden - "Insufficient permissions."

- **Method**: DELETE  
  **Path**: `/api/auth/account`  
  **Description**: Deletes the user account and all associated applications. Requires password confirmation.  
  **Query Parameters**: None  
  **Request JSON Body**:  
  ```json
  {
    "password": "string (required)"
  }
  ```  
  **Response JSON**: Empty  
  **Success Codes/Messages**: 204 No Content - "Account deleted."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Invalid password."  
  - 401 Unauthorized - "Password verification failed."  
  - 403 Forbidden - "Cannot delete account."

### Applications Resource

- **Method**: GET  
  **Path**: `/api/applications`  
  **Description**: Retrieves a paginated list of the user's applications, sorted by created_at DESC. Supports filtering by status.  
  **Query Parameters**:  
  - `status` (optional, enum: 'planned'|'sent'|'in_progress'|'interview'|'rejected'|'offer')  
  - `page` (optional, integer, default 1)  
  - `limit` (optional, integer, default 20, max 100)  
  **Request JSON Body**: None  
  **Response JSON**:  
  ```json
  {
    "applications": [
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
    ],
    "total": integer,
    "page": integer,
    "limit": integer
  }
  ```  
  **Success Codes/Messages**: 200 OK - List retrieved. (Empty array for empty state)  
  **Error Codes/Messages**:  
  - 401 Unauthorized - "Authentication required."

- **Method**: POST  
  **Path**: `/api/applications`  
  **Description**: Creates a new application for the authenticated user. Default status is 'sent' if not provided.  
  **Query Parameters**: None  
  **Request JSON Body**:  
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
  **Response JSON**:  
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
  **Success Codes/Messages**: 201 Created - "Application added."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Missing required fields or invalid status/date."  
  - 401 Unauthorized - "Authentication required."

- **Method**: GET  
  **Path**: `/api/applications/{id}`  
  **Description**: Retrieves details of a specific application.  
  **Query Parameters**: None  
  **Request JSON Body**: None  
  **Response JSON**:  
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
  **Success Codes/Messages**: 200 OK  
  **Error Codes/Messages**:  
  - 401 Unauthorized  
  - 403 Forbidden - "Not your application."  
  - 404 Not Found - "Application not found."

- **Method**: PATCH  
  **Path**: `/api/applications/{id}`  
  **Description**: Partially updates an application (e.g., status or other fields).  
  **Query Parameters**: None  
  **Request JSON Body**: Partial object, e.g.  
  ```json
  {
    "status": "enum value",
    "notes": "string"
  }
  ```  
  **Response JSON**: Updated application object.  
  **Success Codes/Messages**: 200 OK - "Application updated."  
  **Error Codes/Messages**:  
  - 400 Bad Request - "Invalid fields."  
  - 401 Unauthorized  
  - 403 Forbidden  
  - 404 Not Found

- **Method**: DELETE  
  **Path**: `/api/applications/{id}`  
  **Description**: Deletes a specific application.  
  **Query Parameters**: None  
  **Request JSON Body**: None  
  **Response JSON**: Empty  
  **Success Codes/Messages**: 204 No Content  
  **Error Codes/Messages**:  
  - 401 Unauthorized  
  - 403 Forbidden  
  - 404 Not Found

- **Method**: GET  
  **Path**: `/api/applications/stats`  
  **Description**: Retrieves statistics: count of applications by status for the user.  
  **Query Parameters**: None  
  **Request JSON Body**: None  
  **Response JSON**:  
  ```json
  {
    "stats": {
      "planned": 0,
      "sent": 5,
      "in_progress": 2,
      "interview": 1,
      "rejected": 3,
      "offer": 0
    },
    "total": integer
  }
  ```  
  **Success Codes/Messages**: 200 OK  
  **Error Codes/Messages**:  
  - 401 Unauthorized

## 3. Authentication and Authorization

The API uses JWT tokens issued by Supabase Auth. All endpoints except `/api/auth/register` and `/api/auth/login` require a valid `Authorization: Bearer <token>` header. Middleware in Astro API routes (e.g., src/pages/api/) validates the token using Supabase client, extracting `auth.uid()` to set `user_id` for queries. RLS in the database enforces per-user isolation (user_id = auth.uid()). For account deletion, the API calls Supabase auth.admin.deleteUser after password verification. Tokens expire after 1 hour (configurable in Supabase); refresh via Supabase refresh token flow (not exposed in custom API). HTTPS enforced; CORS limited to frontend origin.

## 4. Validation and Business Logic

- **Validation for Applications**:
  - Required: company_name (string, max 255), position_name (string, max 255), application_date (valid date string).
  - Optional: link (string), notes (string).
  - status: Must be one of ENUM values; default 'sent' on create.
  - API layer: Use Zod or similar for schema validation; reject invalid inputs with 400 and specific messages (e.g., "company_name is required").
  - DB layer: NOT NULL constraints and ENUM enforced; API prevents invalid inserts.

- **Validation for Auth/Users**:
  - email: Valid format, unique check via Supabase.
  - password: Min 8 chars; confirm match; hashed via Supabase.
  - API: Validate inputs, handle Supabase errors (e.g., weak password).

- **Business Logic Implementation**:
  - User isolation: All application queries filter by user_id from token; RLS provides defense-in-depth.
  - Default status: Set in POST /api/applications if omitted.
  - Sorting/Filtering: GET /api/applications uses DB ORDER BY created_at DESC; WHERE status = ? for filter; leverages indexes.
  - Pagination: Offset-based (page * limit); total count via separate query.
  - Stats: Aggregate COUNT(*) GROUP BY status WHERE user_id = ?.
  - Cascade delete: Account deletion triggers Supabase deleteUser, DB trigger removes applications.
  - Quick updates: PATCH allows single-field changes (e.g., status); updated_at auto via DB trigger.
  - Error handling: Consistent JSON errors { "error": "message" }; log internals server-side.
  - Rate limiting: Implement via middleware (e.g., 5 req/min on auth endpoints) to prevent abuse.
  - Performance: Queries optimized with indexes; no N+1 issues as Supabase handles joins implicitly.
