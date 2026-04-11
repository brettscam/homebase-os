-- ============================================================
-- PART 2: Row Level Security
-- Run this AFTER 01-tables.sql succeeds
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table properties enable row level security;
alter table rooms enable row level security;
alter table appliances enable row level security;
alter table systems enable row level security;
alter table paint_records enable row level security;
alter table smart_home enable row level security;
alter table emergency_info enable row level security;
alter table exterior enable row level security;
alter table contacts enable row level security;
alter table utilities enable row level security;
alter table energy_bills enable row level security;
alter table documents enable row level security;
alter table projects enable row level security;
alter table project_quotes enable row level security;
alter table project_vendors enable row level security;
alter table integrations enable row level security;
alter table chat_conversations enable row level security;

-- ─── Profiles ───────────────────────────────────────────────
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ─── Properties ─────────────────────────────────────────────
create policy "Users can view own properties"
  on properties for select using (auth.uid() = user_id);
create policy "Users can insert own properties"
  on properties for insert with check (auth.uid() = user_id);
create policy "Users can update own properties"
  on properties for update using (auth.uid() = user_id);
create policy "Users can delete own properties"
  on properties for delete using (auth.uid() = user_id);

-- Helper: does user own this property?
create or replace function user_owns_property(prop_id uuid)
returns boolean as $$
  select exists(
    select 1 from properties where id = prop_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Helper: does user own this project?
create or replace function user_owns_project(proj_id uuid)
returns boolean as $$
  select exists(
    select 1 from projects p
    join properties prop on p.property_id = prop.id
    where p.id = proj_id and prop.user_id = auth.uid()
  );
$$ language sql security definer;

-- ─── All property-owned tables ──────────────────────────────
-- Rooms
create policy "rooms_select" on rooms for select using (user_owns_property(property_id));
create policy "rooms_insert" on rooms for insert with check (user_owns_property(property_id));
create policy "rooms_update" on rooms for update using (user_owns_property(property_id));
create policy "rooms_delete" on rooms for delete using (user_owns_property(property_id));

-- Appliances
create policy "appliances_select" on appliances for select using (user_owns_property(property_id));
create policy "appliances_insert" on appliances for insert with check (user_owns_property(property_id));
create policy "appliances_update" on appliances for update using (user_owns_property(property_id));
create policy "appliances_delete" on appliances for delete using (user_owns_property(property_id));

-- Systems
create policy "systems_select" on systems for select using (user_owns_property(property_id));
create policy "systems_insert" on systems for insert with check (user_owns_property(property_id));
create policy "systems_update" on systems for update using (user_owns_property(property_id));
create policy "systems_delete" on systems for delete using (user_owns_property(property_id));

-- Paint Records
create policy "paint_select" on paint_records for select using (user_owns_property(property_id));
create policy "paint_insert" on paint_records for insert with check (user_owns_property(property_id));
create policy "paint_update" on paint_records for update using (user_owns_property(property_id));
create policy "paint_delete" on paint_records for delete using (user_owns_property(property_id));

-- Smart Home
create policy "smart_select" on smart_home for select using (user_owns_property(property_id));
create policy "smart_insert" on smart_home for insert with check (user_owns_property(property_id));
create policy "smart_update" on smart_home for update using (user_owns_property(property_id));
create policy "smart_delete" on smart_home for delete using (user_owns_property(property_id));

-- Emergency Info
create policy "emergency_select" on emergency_info for select using (user_owns_property(property_id));
create policy "emergency_insert" on emergency_info for insert with check (user_owns_property(property_id));
create policy "emergency_update" on emergency_info for update using (user_owns_property(property_id));
create policy "emergency_delete" on emergency_info for delete using (user_owns_property(property_id));

-- Exterior
create policy "exterior_select" on exterior for select using (user_owns_property(property_id));
create policy "exterior_insert" on exterior for insert with check (user_owns_property(property_id));
create policy "exterior_update" on exterior for update using (user_owns_property(property_id));
create policy "exterior_delete" on exterior for delete using (user_owns_property(property_id));

-- Contacts
create policy "contacts_select" on contacts for select using (user_owns_property(property_id));
create policy "contacts_insert" on contacts for insert with check (user_owns_property(property_id));
create policy "contacts_update" on contacts for update using (user_owns_property(property_id));
create policy "contacts_delete" on contacts for delete using (user_owns_property(property_id));

-- Utilities
create policy "utilities_select" on utilities for select using (user_owns_property(property_id));
create policy "utilities_insert" on utilities for insert with check (user_owns_property(property_id));
create policy "utilities_update" on utilities for update using (user_owns_property(property_id));
create policy "utilities_delete" on utilities for delete using (user_owns_property(property_id));

-- Energy Bills
create policy "bills_select" on energy_bills for select using (user_owns_property(property_id));
create policy "bills_insert" on energy_bills for insert with check (user_owns_property(property_id));
create policy "bills_update" on energy_bills for update using (user_owns_property(property_id));
create policy "bills_delete" on energy_bills for delete using (user_owns_property(property_id));

-- Documents
create policy "docs_select" on documents for select using (user_owns_property(property_id));
create policy "docs_insert" on documents for insert with check (user_owns_property(property_id));
create policy "docs_update" on documents for update using (user_owns_property(property_id));
create policy "docs_delete" on documents for delete using (user_owns_property(property_id));

-- Projects
create policy "projects_select" on projects for select using (user_owns_property(property_id));
create policy "projects_insert" on projects for insert with check (user_owns_property(property_id));
create policy "projects_update" on projects for update using (user_owns_property(property_id));
create policy "projects_delete" on projects for delete using (user_owns_property(property_id));

-- Project Quotes
create policy "quotes_select" on project_quotes for select using (user_owns_project(project_id));
create policy "quotes_insert" on project_quotes for insert with check (user_owns_project(project_id));
create policy "quotes_update" on project_quotes for update using (user_owns_project(project_id));
create policy "quotes_delete" on project_quotes for delete using (user_owns_project(project_id));

-- Project Vendors
create policy "vendors_select" on project_vendors for select using (user_owns_project(project_id));
create policy "vendors_insert" on project_vendors for insert with check (user_owns_project(project_id));
create policy "vendors_update" on project_vendors for update using (user_owns_project(project_id));
create policy "vendors_delete" on project_vendors for delete using (user_owns_project(project_id));

-- Integrations
create policy "integrations_select" on integrations for select using (user_owns_property(property_id));
create policy "integrations_insert" on integrations for insert with check (user_owns_property(property_id));
create policy "integrations_update" on integrations for update using (user_owns_property(property_id));
create policy "integrations_delete" on integrations for delete using (user_owns_property(property_id));

-- Chat Conversations
create policy "chats_select" on chat_conversations for select using (auth.uid() = user_id);
create policy "chats_insert" on chat_conversations for insert with check (auth.uid() = user_id);
create policy "chats_update" on chat_conversations for update using (auth.uid() = user_id);
create policy "chats_delete" on chat_conversations for delete using (auth.uid() = user_id);
