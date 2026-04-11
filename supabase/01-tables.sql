-- ============================================================
-- PART 1: Tables + Triggers
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- ─── Profiles ───────────────────────────────────────────────
create table if not exists profiles (
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Properties ─────────────────────────────────────────────
create table if not exists properties (
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
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  type text,
  floor text,
  sqft text,
  dimensions text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Appliances ─────────────────────────────────────────────
create table if not exists appliances (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete set null,
  name text not null,
  type text,
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
create table if not exists systems (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Paint Records ──────────────────────────────────────────
create table if not exists paint_records (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  room_id uuid references rooms(id) on delete set null,
  room_name text,
  color_name text,
  color_hex text,
  brand text,
  finish text,
  date_painted text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Smart Home ─────────────────────────────────────────────
create table if not exists smart_home (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Emergency Info ─────────────────────────────────────────
create table if not exists emergency_info (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Exterior ───────────────────────────────────────────────
create table if not exists exterior (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Contacts ───────────────────────────────────────────────
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  company text,
  role text,
  phone text,
  email text,
  address text,
  notes text,
  rating integer,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Utilities ──────────────────────────────────────────────
create table if not exists utilities (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
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
create table if not exists energy_bills (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  utility_type text not null,
  billing_period_start date,
  billing_period_end date,
  amount_dollars numeric(10,2),
  usage_amount numeric(10,2),
  usage_unit text,
  source text default 'manual',
  raw_file_url text,
  notes text,
  created_at timestamptz default now()
);

-- ─── Documents ──────────────────────────────────────────────
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  type text,
  file_url text,
  file_type text,
  related_to text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Projects ───────────────────────────────────────────────
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  priority text default 'planned',
  status text default 'planning',
  linked_rooms uuid[] default '{}',
  linked_systems text[] default '{}',
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  target_start_date date,
  actual_cost numeric(10,2),
  completed_date date,
  rating integer,
  notes text,
  is_suggested boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Project Quotes ─────────────────────────────────────────
create table if not exists project_quotes (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  vendor_contact_id uuid references contacts(id) on delete set null,
  vendor_name text,
  total_price numeric(10,2),
  line_items jsonb default '[]'::jsonb,
  timeline_weeks integer,
  warranty_terms text,
  valid_until date,
  attachment_url text,
  notes text,
  status text default 'received',
  submitted_date date,
  created_at timestamptz default now()
);

-- ─── Project Vendors ────────────────────────────────────────
create table if not exists project_vendors (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete set null,
  vendor_name text,
  status text default 'identified',
  contacted_date date,
  notes text,
  created_at timestamptz default now()
);

-- ─── Integrations ───────────────────────────────────────────
create table if not exists integrations (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  type text not null,
  provider text,
  status text default 'manual',
  config jsonb default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Chat History ───────────────────────────────────────────
create table if not exists chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  title text default 'New Chat',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Updated_at trigger function ────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
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
