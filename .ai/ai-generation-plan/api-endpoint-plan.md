# API Endpoint Plan: Motivational Messages

## 1. Summary

This document outlines the design for a new REST API endpoint to provide authenticated users with a daily motivational message. The endpoint will handle the logic for retrieving a user's message for the current day or assigning a new one if none exists. The messages themselves are sourced from a predefined list within the application's source code.

## 2. Endpoint Definition

-   **Method**: `GET`
-   **Path**: `/api/messages/daily-motivation`
-   **Description**: Retrieves the motivational message of the day for the authenticated user. If a message has not yet been assigned for the current day, this endpoint randomly selects one from a predefined list, saves it to the `daily_user_messages` table, and then returns it.

### Request

-   **Authentication**: Required. The request must include a valid JWT for an authenticated user, managed via the Supabase session.
-   **Request Body**: None.

### Response

-   **Success (200 OK)**: A JSON object containing the motivational message.
    ```json
    {
      "message": "Twój dzisiejszy cytat motywacyjny."
    }
    ```
-   **Error (401 Unauthorized)**: Returned if the user is not authenticated.
    ```json
    {
      "error": "Authentication required."
    }
    ```
-   **Error (500 Internal Server Error)**: Returned for any unexpected server-side or database errors.
    ```json
    {
      "error": "An unexpected error occurred."
    }
    ```

## 3. Business Logic and Implementation Details

1.  **Authentication**: The endpoint handler must first verify that the user is authenticated by checking the Supabase session. If not, it will immediately return a `401 Unauthorized` status.
2.  **Timezone Handling**: All date operations will be performed in UTC to ensure consistency. The handler will determine the current date in UTC (e.g., `new Date().toISOString().split('T')[0]`) to use for database queries.
3.  **Idempotent Logic Flow**:
    a. The handler queries the `daily_user_messages` table for a record where the `user_id` matches the authenticated user and the `display_date` matches the current UTC date.
    b. **If a record is found**, the `message_text` from that record is returned in the response.
    c. **If no record is found**, the handler proceeds to:
        i.  Randomly select a message from the predefined list.
        ii. Create a new record in the `daily_user_messages` table with the `user_id`, the selected `message_text`, and the current UTC `display_date`.
        iii. Return the newly selected message in the response.
4.  **Error Handling**: All database operations will be wrapped in a `try...catch` block. If any operation fails, the error will be logged internally, and a generic `500 Internal Server Error` response will be sent to the client.

## 4. File Structure and Data Types

-   **API Handler Location**: The logic for this endpoint will be implemented in a new file at:
    `src/pages/api/messages/daily-motivation.ts`
-   **Predefined Messages**: The list of 20 motivational messages in Polish will be stored in a new constants file at:
    `src/lib/constants/motivational-messages.ts`
-   **TypeScript Types**: The response payload will be typed for safety. This type definition should be added to a shared types file (e.g., `src/types.ts`):
    ```typescript
    export interface DailyMotivationResponse {
      message: string;
    }
    ```
