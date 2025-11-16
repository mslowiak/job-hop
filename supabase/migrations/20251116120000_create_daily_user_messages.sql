/*
Migration: Create daily_user_messages table
Purpose: Introduces a new table to track the daily motivational message assigned to each user, ensuring users see the same message for an entire day and maintaining history.
Affected Tables/Columns: New table public.daily_user_messages with columns id, user_id, message_text, display_date, created_at.
Special Considerations: Row Level Security (RLS) is enabled with granular policies restricting access to authenticated users' own records only. Foreign key to auth.users with CASCADE delete for data privacy. Messages themselves are hardcoded in the application, not stored in DB.
Author: AI Assistant
Date: 2025-11-16
*/

-- create the daily_user_messages table
-- this table stores records of motivational messages displayed to users on specific dates
-- ensuring consistency for the day and logging history
create table public.daily_user_messages (
    id uuid not null default gen_random_uuid(),
    -- unique identifier for each message record
    user_id uuid not null,
    -- foreign key to the authenticated user who received the message
    message_text text not null,
    -- the actual content of the motivational message
    display_date date not null,
    -- the date when the message was displayed to the user
    created_at timestamp with time zone not null default now(),
    -- timestamp when the record was created
    constraint daily_user_messages_pkey primary key (id),
    constraint daily_user_messages_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
    -- cascade delete ensures user data is cleaned up if account is deleted
);

-- add comments to the table and columns for documentation
comment on table public.daily_user_messages is 'stores the motivational message assigned to a user for a specific day.';
comment on column public.daily_user_messages.id is 'unique identifier for the record.';
comment on column public.daily_user_messages.user_id is 'links to the authenticated user.';
comment on column public.daily_user_messages.message_text is 'the content of the motivational message that was displayed.';
comment on column public.daily_user_messages.display_date is 'the date the message was displayed to the user.';
comment on column public.daily_user_messages.created_at is 'timestamp of when the record was created.';

-- enable row level security (rls) on the table
-- rls ensures that users can only access their own data, enhancing security
alter table public.daily_user_messages enable row level security;

-- create rls policy for select operations
-- allows authenticated users to read only their own daily message records
-- using clause checks that the user_id matches the current authenticated user
create policy "users can select their own daily messages" on public.daily_user_messages
    for select
    to authenticated
    using (auth.uid() = user_id);

-- create rls policy for insert operations
-- allows authenticated users to insert records for themselves only
-- with check ensures the inserted record has the correct user_id
create policy "users can insert their own daily messages" on public.daily_user_messages
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create rls policy for update operations
-- allows authenticated users to update only their own records
-- using checks read access, with check verifies the updated data belongs to them
create policy "users can update their own daily messages" on public.daily_user_messages
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create rls policy for delete operations
-- allows authenticated users to delete only their own records
-- using clause ensures they can only delete what they own
create policy "users can delete their own daily messages" on public.daily_user_messages
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- no policies created for anon role as this table contains private user data
-- without policies, anon users will be denied access by default when rls is enabled
