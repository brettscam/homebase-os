# PRD: Supabase Migration & New Tab Structure

## What Changed

### Architecture: localStorage → Supabase
- **Auth**: Replaced `@base44/sdk` auth with Supabase Auth (email/password + magic link)
- **Data**: All home data now persists to Supabase (with localStorage as fallback/draft during onboarding)
- **RLS**: Every table has Row Level Security — users can only access their own data
- **Multi-property**: Data model supports multiple properties per user

### New Tab Structure
```
Home | Manual | Projects | Insights | Integrations | Contacts
```

- **Home** — Dashboard, health score, quick access (unchanged)
- **Manual** — Full home reference manual (unchanged)
- **Projects** — Planning, quotes, contractor management (PRD exists, current lifecycle tracker still works)
- **Insights** (NEW) — System health, energy analysis, savings opportunities. Lifecycle data moved here from Projects
- **Integrations** (NEW) — Upload energy bills, connect providers (manual entry works now, auto-connect coming)
- **Contacts** — Contractors, service providers (unchanged)

### Login Flow
- New `/Login` page with email/password and magic link options
- Unauthenticated users see login screen (no more broken auth redirects)
- Sign up creates Supabase profile automatically

### AI Features
- `base44.integrations.Core.InvokeLLM` calls temporarily disabled
- Property lookup, document extraction, AI chat, and project suggestions show "coming soon" messages
- These need a new AI backend (options: Supabase Edge Functions + Claude API, or standalone API)

---

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Settings > API

### 2. Run Schema
1. Open SQL Editor in Supabase Dashboard
2. Paste and run `supabase/schema.sql`
3. This creates all tables, RLS policies, and triggers

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Auth
In Supabase Dashboard > Authentication > Providers:
- Email provider is enabled by default
- For magic links: ensure email templates are configured

### 5. Storage Buckets (optional, for file uploads later)
Create these buckets in Supabase Dashboard > Storage:
- `documents` — PDFs, manuals, warranties
- `photos` — Property/room photos
- `energy-bills` — Uploaded bill scans

---

## Database Schema Overview

| Table | Purpose |
|---|---|
| `profiles` | User profiles (auto-created on signup) |
| `properties` | Houses — address, sqft, year built, etc. |
| `rooms` | Rooms per property |
| `appliances` | Appliances per property |
| `systems` | HVAC, water heater, electrical, plumbing |
| `paint_records` | Paint colors per room |
| `smart_home` | WiFi, locks, security, garage |
| `emergency_info` | Shutoff locations and emergency contacts |
| `exterior` | Roof, gutters, siding |
| `contacts` | Contractors and service providers |
| `utilities` | Utility accounts |
| `energy_bills` | Monthly consumption + costs (for Insights) |
| `documents` | Uploaded files |
| `projects` | Full project lifecycle |
| `project_quotes` | Quotes per project |
| `project_vendors` | Vendor outreach tracking |
| `integrations` | Connected services |
| `chat_conversations` | AI chat history |

---

## What's Next

### Immediate (to get test users in)
1. Create Supabase project and run schema
2. Add env vars
3. Test: sign up → onboarding → home dashboard
4. Invite 1-2 test users

### Short-term
1. Re-enable AI features with new backend (Claude API via Supabase Edge Functions)
2. Build out Projects tab per existing PRD
3. Add file upload for bills and documents (Supabase Storage)

### Medium-term
1. Energy provider API integrations (utility connect)
2. Smart home integrations (Nest, Ring, etc.)
3. AI-powered bill extraction from uploaded PDFs
