# Database Plan: Motivational Messages

## 1. Summary

This plan outlines the database schema changes required to implement the daily motivational message feature. The core of this change is the introduction of a new table, `daily_user_messages`, to track which message is displayed to each user on a given day. For the MVP, the motivational messages themselves will be stored in the application's source code, not in the database.

## 2. Schema Changes

### 2.1. New Table: `daily_user_messages`

This table will store a record of the motivational message assigned to a user for a specific day.

-   **Table Name**: `daily_user_messages`
-   **Purpose**: To ensure a user sees the same motivational message for an entire day and to log message history.

#### Columns

| Column Name      | Type                            | Constraints                                           | Description                                                 |
| ---------------- | ------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `id`             | `uuid`                          | `PRIMARY KEY`, `default gen_random_uuid()`            | Unique identifier for the record.                           |
| `user_id`        | `uuid`                          | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Foreign key linking to the authenticated user.              |
| `message_text`   | `text`                          | `NOT NULL`                                            | The content of the motivational message that was displayed. |
| `display_date`   | `date`                          | `NOT NULL`                                            | The date the message was displayed to the user.             |
| `created_at`     | `timestamp with time zone`      | `default now()`                                       | Timestamp of when the record was created.                   |

### 2.2. SQL Migration Script

```sql
-- Create the daily_user_messages table
CREATE TABLE public.daily_user_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    message_text text NOT NULL,
    display_date date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT daily_user_messages_pkey PRIMARY KEY (id),
    CONSTRAINT daily_user_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.daily_user_messages IS 'Stores the motivational message assigned to a user for a specific day.';
COMMENT ON COLUMN public.daily_user_messages.user_id IS 'Links to the authenticated user.';
COMMENT ON COLUMN public.daily_user_messages.message_text IS 'The content of the motivational message.';
COMMENT ON COLUMN public.daily_user_messages.display_date IS 'The date the message was displayed.';

-- Enable Row-Level Security (RLS)
ALTER TABLE public.daily_user_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to manage their own messages"
ON public.daily_user_messages
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

```

## 3. Data Management and Logic

-   **Message Source**: A predefined list of 20 motivational sentences will be maintained in the application's source code (e.g., in a constants file). The database will not have a table for the messages themselves.
-   **Assignment Logic**: Message assignment will be handled on-demand by the API. When a user requests their daily message, the API will first check the `daily_user_messages` table for an entry corresponding to the `user_id` and the current date.
    -   If a record exists, the `message_text` from that record is returned.
    -   If no record exists, the API will randomly select a message from the hardcoded list, create a new record in `daily_user_messages`, and then return the selected message.

## 4. Security

-   **Row-Level Security (RLS)**: RLS is enabled on the `daily_user_messages` table to ensure that users can only access their own records. The policy enforces that the `user_id` in any query must match the ID of the currently authenticated user (`auth.uid()`).
-   **Cascading Deletes**: The `ON DELETE CASCADE` constraint on the `user_id` foreign key ensures that if a user deletes their account, all their corresponding records in `daily_user_messages` will be automatically and permanently removed, maintaining data privacy and integrity.
