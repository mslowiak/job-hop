-- migration: create applications table
-- purpose: initial schema setup for jobhop mvp
-- affected: applications table, application_status enum type
-- notes: implements one-to-many relationship with auth.users, includes rls policies and optimized indexes

-- ==============================================================================
-- step 1: create enum type for application status
-- ==============================================================================
-- defines possible application statuses with english values
-- default value 'sent' will be set in application logic, not in database
create type application_status as enum (
  'planned',
  'sent',
  'in_progress',
  'interview',
  'rejected',
  'offer'
);

-- ==============================================================================
-- step 2: create applications table
-- ==============================================================================
-- stores job application records with direct reference to auth.users
-- one user can have many applications (one-to-many relationship)
create table applications (
  -- primary key: unique identifier for each application
  id uuid primary key default gen_random_uuid(),
  
  -- foreign key: links application to authenticated user
  -- on delete cascade ensures applications are deleted when user is deleted
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- required fields: core application data
  company_name varchar(255) not null,
  position_name varchar(255) not null,
  application_date date not null,
  
  -- optional fields: additional application details
  link text null,
  notes text null,
  
  -- status field: current state of application
  -- not null constraint ensures every application has a status
  -- default value will be set in application logic
  status application_status not null,
  
  -- audit fields: track record creation and modification
  created_at timestamp with time zone default current_timestamp not null,
  updated_at timestamp with time zone default current_timestamp not null
);

-- ==============================================================================
-- step 3: create indexes for query optimization
-- ==============================================================================
-- composite index for sorting applications by creation date per user
-- optimizes queries like: select * from applications where user_id = ? order by created_at desc
create index idx_applications_user_created on applications(user_id, created_at desc);

-- composite index for filtering by status per user
-- optimizes aggregate queries like: select status, count(*) from applications where user_id = ? group by status
create index idx_applications_user_status on applications(user_id, status);

-- composite index for sorting by application date per user
-- optimizes queries like: select * from applications where user_id = ? order by application_date desc
create index idx_applications_user_application_date on applications(user_id, application_date desc);

-- ==============================================================================
-- step 4: create trigger function for automatic updated_at timestamp
-- ==============================================================================
-- updates the updated_at field automatically whenever a record is modified
-- ensures audit trail without requiring application logic to set the timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

-- ==============================================================================
-- step 5: attach trigger to applications table
-- ==============================================================================
-- before update trigger ensures updated_at is set before the update is committed
create trigger set_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

-- ==============================================================================
-- step 6: enable row level security
-- ==============================================================================
-- rls ensures users can only access their own application records
-- critical for data isolation in multi-tenant application
alter table applications enable row level security;

-- ==============================================================================
-- step 7: create rls policies for anonymous users
-- ==============================================================================
-- anonymous users have no access to applications table
-- all operations require authentication

-- policy: anonymous users cannot select any records
create policy "anon_select_applications"
  on applications
  for select
  to anon
  using (false);

-- policy: anonymous users cannot insert any records
create policy "anon_insert_applications"
  on applications
  for insert
  to anon
  with check (false);

-- policy: anonymous users cannot update any records
create policy "anon_update_applications"
  on applications
  for update
  to anon
  using (false)
  with check (false);

-- policy: anonymous users cannot delete any records
create policy "anon_delete_applications"
  on applications
  for delete
  to anon
  using (false);

-- ==============================================================================
-- step 8: create rls policies for authenticated users
-- ==============================================================================
-- authenticated users can only access their own application records
-- user_id must match auth.uid() for all operations

-- policy: users can select only their own applications
-- enables dashboard list view and filtering (us-003)
create policy "authenticated_select_applications"
  on applications
  for select
  to authenticated
  using (user_id = auth.uid());

-- policy: users can insert applications for themselves only
-- enables adding new applications (us-002)
create policy "authenticated_insert_applications"
  on applications
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy: users can update only their own applications
-- enables editing applications and quick status change (us-002)
create policy "authenticated_update_applications"
  on applications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy: users can delete only their own applications
-- enables removing applications (us-002)
create policy "authenticated_delete_applications"
  on applications
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ==============================================================================
-- migration complete
-- ==============================================================================
-- the schema is now ready for jobhop mvp with:
-- - proper user isolation via rls
-- - optimized queries via composite indexes
-- - automatic audit trail via updated_at trigger
-- - cascade delete for data consistency
-- ==============================================================================

