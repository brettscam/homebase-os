-- ============================================================
-- HomeBase OS — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- gen_random_uuid() is built-in to Supabase (Postgres 15+), no extension needed.

-- ─── Profiles ───────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific data
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Properties ─────────────────────────────────────────────
-- A user can have multiple properties
create table properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text default 'My Home',
  address text,
  city text,
  state text,
  zip text,
  year_built text,
  sqft text,
  lot_size text,
  stories text,
  bedrooms text,
  bathrooms text,
  is_active boolean default true,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Rooms ──────────────────────────────────────────────────
create table rooms (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  type text, -- bedroom, bathroom, kitchen, living, etc.
  floor text,
  sqft text,
  dimensions text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Appliances ─────────────────────────────────────────────
create table appliances (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete set null,
  name text not null,
  type text, -- refrigerator, dishwasher, washer, dryer, etc.
  brand text,
  model text,
  serial_number text,
  install_date text,
  purchase_date text,
  warranty_expiry text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Systems ────────────────────────────────────────────────
-- Major home systems (HVAC, water heater, electrical, plumbing)
create table systems (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- hvac, water_heater, electrical, plumbing
  data jsonb default '{}'::jsonb, -- flexible key-value for system-specific fields
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Paint Records ──────────────────────────────────────────
create table paint_records (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete set null,
  room_name text,
  color_name text,
  color_hex text,
  brand text,
  finish text, -- matte, eggshell, satin, semi-gloss, gloss
  date_painted text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Smart Home ─────────────────────────────────────────────
create table smart_home (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- wifi, door_lock, security, garage
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Emergency Info ─────────────────────────────────────────
create table emergency_info (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- water_shutoff, gas_shutoff, electrical_panel, contact
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Exterior ───────────────────────────────────────────────
create table exterior (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- roof, gutters, siding
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Contacts ───────────────────────────────────────────────
-- Contractors, service providers, etc.
create table contacts (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  company text,
  role text, -- plumber, electrician, hvac, general, etc.
  phone text,
  email text,
  address text,
  notes text,
  rating integer, -- 1-5
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Utilities ──────────────────────────────────────────────
create table utilities (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- electric, gas, water, sewer, internet, trash
  provider text,
  account_number text,
  phone text,
  website text,
  login_email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Energy Bills ───────────────────────────────────────────
-- For Insights tab — tracks consumption over time
create table energy_bills (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  utility_type text not null, -- electric, gas, water
  billing_period_start date,
  billing_period_end date,
  amount_dollars numeric(10,2),
  usage_amount numeric(10,2), -- kWh, therms, gallons
  usage_unit text, -- kWh, therms, gallons, ccf
  source text default 'manual', -- manual, uploaded, connected
  raw_file_url text, -- if uploaded
  notes text,
  created_at timestamptz default now()
);

-- ─── Documents ──────────────────────────────────────────────
create table documents (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  type text, -- warranty, manual, receipt, inspection, permit, etc.
  file_url text,
  file_type text, -- pdf, image, etc.
  related_to text, -- what system/appliance/room this relates to
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Projects ───────────────────────────────────────────────
-- Full project lifecycle (planning → quoting → comparing → in_progress → complete)
create table projects (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  title text not null,
  description text,
  category text, -- repair, remodel, upgrade, maintenance, addition
  priority text default 'planned', -- urgent, soon, planned, someday
  status text default 'planning', -- planning, quoting, comparing, in_progress, complete
  linked_rooms uuid[] default '{}',
  linked_systems text[] default '{}', -- roof, hvac, windows, etc.
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  target_start_date date,
  actual_cost numeric(10,2),
  completed_date date,
  rating integer, -- 1-5 how did the project go
  notes text,
  is_suggested boolean default false, -- auto-generated from aging systems
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Project Quotes ─────────────────────────────────────────
create table project_quotes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  vendor_contact_id uuid references contacts(id) on delete set null,
  vendor_name text, -- in case no contact linked
  total_price numeric(10,2),
  line_items jsonb default '[]'::jsonb, -- [{description, amount}]
  timeline_weeks integer,
  warranty_terms text,
  valid_until date,
  attachment_url text,
  notes text,
  status text default 'received', -- received, accepted, declined
  submitted_date date,
  created_at timestamptz default now()
);

-- ─── Project Vendors (tracking outreach) ────────────────────
create table project_vendors (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  vendor_name text,
  status text default 'identified', -- identified, contacted, quoted, declined, accepted
  contacted_date date,
  notes text,
  created_at timestamptz default now()
);

-- ─── Integrations ───────────────────────────────────────────
-- Tracks connected services (energy providers, smart home, etc.)
create table integrations (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null, -- energy_provider, smart_home, thermostat
  provider text, -- PG&E, Nest, Ring, etc.
  status text default 'manual', -- manual, connected, disconnected, error
  config jsonb default '{}'::jsonb, -- provider-specific config
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Chat History ───────────────────────────────────────────
create table chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  title text default 'New Chat',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- Users can only access their own data
-- ============================================================

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

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Properties: users can CRUD their own properties
create policy "Users can view own properties"
  on properties for select using (auth.uid() = user_id);
create policy "Users can insert own properties"
  on properties for insert with check (auth.uid() = user_id);
create policy "Users can update own properties"
  on properties for update using (auth.uid() = user_id);
create policy "Users can delete own properties"
  on properties for delete using (auth.uid() = user_id);

-- Helper function: check if user owns a property
create or replace function user_owns_property(prop_id uuid)
returns boolean as $$
  select exists(
    select 1 from properties where id = prop_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Macro for property-owned tables
-- Rooms
create policy "Users can view own rooms"
  on rooms for select using (user_owns_property(property_id));
create policy "Users can insert own rooms"
  on rooms for insert with check (user_owns_property(property_id));
create policy "Users can update own rooms"
  on rooms for update using (user_owns_property(property_id));
create policy "Users can delete own rooms"
  on rooms for delete using (user_owns_property(property_id));

-- Appliances
create policy "Users can view own appliances"
  on appliances for select using (user_owns_property(property_id));
create policy "Users can insert own appliances"
  on appliances for insert with check (user_owns_property(property_id));
create policy "Users can update own appliances"
  on appliances for update using (user_owns_property(property_id));
create policy "Users can delete own appliances"
  on appliances for delete using (user_owns_property(property_id));

-- Systems
create policy "Users can view own systems"
  on systems for select using (user_owns_property(property_id));
create policy "Users can insert own systems"
  on systems for insert with check (user_owns_property(property_id));
create policy "Users can update own systems"
  on systems for update using (user_owns_property(property_id));
create policy "Users can delete own systems"
  on systems for delete using (user_owns_property(property_id));

-- Paint Records
create policy "Users can view own paint records"
  on paint_records for select using (user_owns_property(property_id));
create policy "Users can insert own paint records"
  on paint_records for insert with check (user_owns_property(property_id));
create policy "Users can update own paint records"
  on paint_records for update using (user_owns_property(property_id));
create policy "Users can delete own paint records"
  on paint_records for delete using (user_owns_property(property_id));

-- Smart Home
create policy "Users can view own smart home"
  on smart_home for select using (user_owns_property(property_id));
create policy "Users can insert own smart home"
  on smart_home for insert with check (user_owns_property(property_id));
create policy "Users can update own smart home"
  on smart_home for update using (user_owns_property(property_id));
create policy "Users can delete own smart home"
  on smart_home for delete using (user_owns_property(property_id));

-- Emergency Info
create policy "Users can view own emergency info"
  on emergency_info for select using (user_owns_property(property_id));
create policy "Users can insert own emergency info"
  on emergency_info for insert with check (user_owns_property(property_id));
create policy "Users can update own emergency info"
  on emergency_info for update using (user_owns_property(property_id));
create policy "Users can delete own emergency info"
  on emergency_info for delete using (user_owns_property(property_id));

-- Exterior
create policy "Users can view own exterior"
  on exterior for select using (user_owns_property(property_id));
create policy "Users can insert own exterior"
  on exterior for insert with check (user_owns_property(property_id));
create policy "Users can update own exterior"
  on exterior for update using (user_owns_property(property_id));
create policy "Users can delete own exterior"
  on exterior for delete using (user_owns_property(property_id));

-- Contacts
create policy "Users can view own contacts"
  on contacts for select using (user_owns_property(property_id));
create policy "Users can insert own contacts"
  on contacts for insert with check (user_owns_property(property_id));
create policy "Users can update own contacts"
  on contacts for update using (user_owns_property(property_id));
create policy "Users can delete own contacts"
  on contacts for delete using (user_owns_property(property_id));

-- Utilities
create policy "Users can view own utilities"
  on utilities for select using (user_owns_property(property_id));
create policy "Users can insert own utilities"
  on utilities for insert with check (user_owns_property(property_id));
create policy "Users can update own utilities"
  on utilities for update using (user_owns_property(property_id));
create policy "Users can delete own utilities"
  on utilities for delete using (user_owns_property(property_id));

-- Energy Bills
create policy "Users can view own energy bills"
  on energy_bills for select using (user_owns_property(property_id));
create policy "Users can insert own energy bills"
  on energy_bills for insert with check (user_owns_property(property_id));
create policy "Users can update own energy bills"
  on energy_bills for update using (user_owns_property(property_id));
create policy "Users can delete own energy bills"
  on energy_bills for delete using (user_owns_property(property_id));

-- Documents
create policy "Users can view own documents"
  on documents for select using (user_owns_property(property_id));
create policy "Users can insert own documents"
  on documents for insert with check (user_owns_property(property_id));
create policy "Users can update own documents"
  on documents for update using (user_owns_property(property_id));
create policy "Users can delete own documents"
  on documents for delete using (user_owns_property(property_id));

-- Projects
create policy "Users can view own projects"
  on projects for select using (user_owns_property(property_id));
create policy "Users can insert own projects"
  on projects for insert with check (user_owns_property(property_id));
create policy "Users can update own projects"
  on projects for update using (user_owns_property(property_id));
create policy "Users can delete own projects"
  on projects for delete using (user_owns_property(property_id));

-- Project Quotes (through project ownership)
create or replace function user_owns_project(proj_id uuid)
returns boolean as $$
  select exists(
    select 1 from projects p
    join properties prop on p.property_id = prop.id
    where p.id = proj_id and prop.user_id = auth.uid()
  );
$$ language sql security definer;

create policy "Users can view own project quotes"
  on project_quotes for select using (user_owns_project(project_id));
create policy "Users can insert own project quotes"
  on project_quotes for insert with check (user_owns_project(project_id));
create policy "Users can update own project quotes"
  on project_quotes for update using (user_owns_project(project_id));
create policy "Users can delete own project quotes"
  on project_quotes for delete using (user_owns_project(project_id));

-- Project Vendors
create policy "Users can view own project vendors"
  on project_vendors for select using (user_owns_project(project_id));
create policy "Users can insert own project vendors"
  on project_vendors for insert with check (user_owns_project(project_id));
create policy "Users can update own project vendors"
  on project_vendors for update using (user_owns_project(project_id));
create policy "Users can delete own project vendors"
  on project_vendors for delete using (user_owns_project(project_id));

-- Integrations
create policy "Users can view own integrations"
  on integrations for select using (user_owns_property(property_id));
create policy "Users can insert own integrations"
  on integrations for insert with check (user_owns_property(property_id));
create policy "Users can update own integrations"
  on integrations for update using (user_owns_property(property_id));
create policy "Users can delete own integrations"
  on integrations for delete using (user_owns_property(property_id));

-- Chat Conversations
create policy "Users can view own chats"
  on chat_conversations for select using (auth.uid() = user_id);
create policy "Users can insert own chats"
  on chat_conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own chats"
  on chat_conversations for update using (auth.uid() = user_id);
create policy "Users can delete own chats"
  on chat_conversations for delete using (auth.uid() = user_id);

-- ============================================================
-- Updated_at triggers
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger update_properties_updated_at before update on properties for each row execute function update_updated_at();
create trigger update_rooms_updated_at before update on rooms for each row execute function update_updated_at();
create trigger update_appliances_updated_at before update on appliances for each row execute function update_updated_at();
create trigger update_systems_updated_at before update on systems for each row execute function update_updated_at();
create trigger update_paint_records_updated_at before update on paint_records for each row execute function update_updated_at();
create trigger update_smart_home_updated_at before update on smart_home for each row execute function update_updated_at();
create trigger update_emergency_info_updated_at before update on emergency_info for each row execute function update_updated_at();
create trigger update_exterior_updated_at before update on exterior for each row execute function update_updated_at();
create trigger update_contacts_updated_at before update on contacts for each row execute function update_updated_at();
create trigger update_utilities_updated_at before update on utilities for each row execute function update_updated_at();
create trigger update_documents_updated_at before update on documents for each row execute function update_updated_at();
create trigger update_projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger update_integrations_updated_at before update on integrations for each row execute function update_updated_at();
create trigger update_chat_conversations_updated_at before update on chat_conversations for each row execute function update_updated_at();

-- ============================================================
-- Storage Buckets (run in Supabase Dashboard > Storage)
-- ============================================================
-- Create these buckets manually in the Supabase Dashboard:
-- 1. "documents" — for uploaded PDFs, manuals, warranties
-- 2. "photos" — for property/room/project photos
-- 3. "energy-bills" — for uploaded utility bill scans
--
-- Set each bucket's policies to allow authenticated users
-- to upload/read their own files (use user_id folder structure).
