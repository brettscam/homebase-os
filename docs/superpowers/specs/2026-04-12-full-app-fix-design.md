# HomeBase OS: Full App Fix — Design Spec
**Date:** 2026-04-12  
**Status:** Draft  
**Depends on:** `2026-04-12-homer-ai-doc-processing-design.md` (Homer AI spec, already approved)

## Problem Statement

A full audit of HomeBase OS reveals the app is ~55% operational. The read-side works well (dashboards display data from Supabase), but the write-side is broken — 3 major pages save data to browser localStorage instead of Supabase, 11+ features are stubbed/disabled, 5 delete functions are missing from the data layer, and several components still render hardcoded demo data. A user who adds contacts, tracks projects, or chats with Homer will lose all that data on a cache clear or device switch.

## Scope

Three sub-projects, executed in order:

1. **Supabase Data Migration + Missing CRUD** — wire localStorage pages to Supabase
2. **Stub & Component Cleanup** — make every button and feature functional
3. **Homer AI Backend** — Edge Function + Claude API + document processing

Sub-projects 1 and 2 are pure frontend work with no infrastructure dependencies. Sub-project 3 requires a Supabase Edge Function and an Anthropic API key secret.

---

## Sub-project 1: Supabase Data Migration + Missing CRUD

### 1A. ContactsAccounts.jsx → Supabase

**Current state:** Page imports `homeDataStore.js` and reads/writes contacts and utilities to `localStorage` key `homebase_home_data`. Full CRUD UI exists (add/edit/delete providers, utility accounts, job history). 

**Target state:** All reads/writes go through `supabaseDataStore.js` functions that already exist but are never called:
- `upsertContact(contact)` / `getContacts(propertyId)` / `deleteContact(contactId)`
- `upsertUtility(utility)` / `getUtilities(propertyId)` / `deleteUtility(utilityId)`

**Changes:**
- Replace `import { getHomeData, saveHomeData } from '../lib/homeDataStore'` with `import { upsertContact, deleteContact, upsertUtility, deleteUtility } from '../lib/supabaseDataStore'`
- Replace `useProperty()` to get `activeProperty` and `homeData` (contacts + utilities already loaded by PropertyContext via `loadFullHomeData`)
- On form submit: call `upsertContact({ ...formData, property_id: activeProperty.id })` instead of mutating localStorage array
- On delete: call `deleteContact(id)` instead of filtering localStorage array
- Same pattern for utilities
- After each mutation: call `refreshProperties()` from PropertyContext to reload data
- Remove all `getHomeData()` / `saveHomeData()` calls
- Job history: store as JSON array inside the contact record's `notes` or a new `job_history` jsonb column. For now, use the existing `notes` text field to store JSON (no schema change needed — serialize/deserialize in the UI).

**Data shape mapping (localStorage → Supabase):**
```
localStorage contact:
{ id, name, trade, company, phone, email, address, notes, emergency, favorite, rating, jobs[] }

Supabase contacts table columns (from 01-tables.sql):
id, property_id, name, company, role, phone, email, address, notes, rating, is_favorite,
created_at, updated_at

Mapping: trade → role, favorite → is_favorite, rating → rating (all exist in DB!)
Missing from DB: emergency (boolean), jobs[] (array)
→ Store emergency flag and job history in notes as JSON:
  { text: "user notes here", emergency: true, jobs: [{description, cost, date}] }
```

**Utility accounts mapping:**
```
localStorage utility:
{ id, provider, type, accountNumber, monthlyCost, autopay, notes }

Supabase utilities table columns (from 01-tables.sql):
id, property_id, type, provider, account_number, phone, website, login_email, notes,
created_at, updated_at

Mapping: accountNumber → account_number, provider → provider, type → type
Missing from DB: monthlyCost, autopay
→ Store monthlyCost and autopay in notes as JSON:
  { text: "user notes", monthly_cost: 125.00, autopay: true }
Note: monthly_cost is NOT a column on utilities table (it IS on energy_bills).
```

### 1B. Projects.jsx → Supabase

**Current state:** Page reads/writes component lifecycle data to `localStorage` key `homebase_components`. Full UI exists (add/edit/delete components, card/timeline views, filters, import from home data). Never touches Supabase.

**Target state:** Reads/writes via `supabaseDataStore.js`:
- `upsertProject(project)` / `getProjects(propertyId)` / `deleteProject(projectId)`

**Changes:**
- Replace localStorage `homebase_components` with Supabase `projects` table
- Map component data to project record format:
  ```
  localStorage component:
  { id, name, category, subtype, installYear, lifespanYears, brand, model, location, 
    replacementCost, warrantyExpiry, lastServiceDate, notes }
  
  Supabase projects table (from 01-tables.sql):
  id, property_id, title, description, category, priority (default 'planned'),
  status (default 'planning'), linked_rooms (uuid[]), linked_systems (text[]),
  budget_min, budget_max, target_start_date, actual_cost, completed_date,
  rating, notes, is_suggested, created_at, updated_at
  
  Mapping:
    name → title
    category → category
    subtype+brand+model → description
    installYear → target_start_date (as date)
    replacementCost → budget_max
    notes → notes (as JSON with extra fields)
  
  Component-specific fields stored as JSON in description:
  { subtype, lifespanYears, brand, model, location, warrantyExpiry, lastServiceDate }
  ```
- The projects table is general-purpose. Component lifecycle metadata (lifespanYears, subtype, warrantyExpiry, lastServiceDate) goes in `description` as JSON. The `title` field holds the display name. `category` maps directly. No schema changes needed.
- "Import from Home Data" button: read from `homeData.systems` and `homeData.appliances` (already in PropertyContext) instead of localStorage `getHomeData()`.
- After mutations: call `refreshProperties()` to reload.

### 1C. AskAI.jsx Chat History → Supabase

**Current state:** Chat conversations stored in localStorage via `homeDataStore.js` functions `getChatHistory`, `createConversation`, `updateConversation`, `deleteConversation`. AI response is a stub string.

**Target state:** Chat history persisted to Supabase `chat_conversations` table:
- `upsertChatConversation(convo)` / `getChatConversations(userId)` / `deleteChatConversation(convoId)`

**Changes:**
- Replace `homeDataStore` chat functions with `supabaseDataStore` equivalents
- Load conversations via `getChatConversations(user.id)` on mount
- On new message: `upsertChatConversation({ id, user_id: user.id, title, messages: [...], updated_at })` 
- On delete: `deleteChatConversation(id)`
- On rename: `upsertChatConversation({ id, title: newTitle })`
- Remove `buildHomeContext()` demo data fallback — build context from PropertyContext's `activeProperty` + `homeData` instead
- Keep AI response as stub for now (Sub-project 3 replaces it with real Claude responses)

### 1D. Admin.jsx Cleanup

**Current state:** Mixed localStorage (`homebase_admin` key) and Supabase. Property cards and switching use localStorage `adminData.properties`.

**Target state:** Fully Supabase-backed via PropertyContext.

**Changes:**
- Properties tab: use `allProperties` from PropertyContext instead of localStorage
- "Add Property" calls `createProperty(user.id, data)` (already does in some paths)
- "Switch Property" calls `switchProperty(propertyId)` from PropertyContext
- "Delete Property" calls Supabase delete (need to add `deleteProperty` function)
- "Export Data" builds JSON from PropertyContext's `homeData` instead of localStorage
- "Clear All Data" deletes from Supabase tables, not localStorage
- Remove `getAdminData` / `saveAdminData` imports entirely

### 1E. Missing Delete Functions

Add to `supabaseDataStore.js`:
```javascript
deleteSystem(systemId)        // systems table
deleteSmartHome(smartHomeId)  // smart_home table
deleteEmergencyInfo(infoId)   // emergency_info table
deleteExterior(exteriorId)    // exterior table
deleteProjectVendor(vendorId) // project_vendors table
deleteProperty(propertyId)    // properties table (cascade deletes children via FK)
```

All follow the existing pattern: `supabase.from('table').delete().eq('id', id)`.

---

## Sub-project 2: Stub & Component Cleanup

### 2A. AddInfoModal → Actually Save Data

**Current state:** Modal shows file upload UI and notes field, but `handleSubmit()` only fires a toast. Files stored in component state, never persisted.

**Target state:** Modal saves data to the appropriate Supabase table based on `section` prop.

**Changes:**
- Accept `propertyId` and `onSave` callback as props
- On submit:
  1. If files attached and Supabase Storage is set up (Sub-project 3): upload to `homebase-uploads/{user_id}/{property_id}/`
  2. Call the appropriate upsert function based on `section`:
     - `vitals` / `systems` → `upsertSmartHome` or `upsertSystem`
     - `spaces` → `upsertRoom`
     - `appliances` → `upsertAppliance`
     - `mechanical` → `upsertSystem`
     - `aesthetics` → `upsertPaintRecord`
     - `exterior` → `upsertExterior`
     - `landscape` → show message ("Landscape data coming soon")
     - `documents` → `upsertDocument`
     - `emergency` → `upsertEmergencyInfo`
  3. Call `onSave()` callback to trigger data refresh
- For now (before Sub-project 3): save notes/metadata to the correct table. File upload requires Supabase Storage bucket which is set up in Sub-project 3.

### 2B. FuseBoxDiagram → Read from Real Data

**Current state:** Hardcoded array of 16 breakers with fixed rooms, amperage, labels.

**Target state:** Accept `electricalData` prop from parent, render breakers from data if available, show "No breaker data" empty state if not.

**Changes:**
- New prop: `electricalData` (from `legacySystems.electrical` or `systems.find(s => s.type === 'electrical')?.data`)
- If `electricalData.breakers` array exists: render from data
- If not: show simplified view with just the main breaker info (amperage, location) and a message "Add breaker details to see full panel diagram"
- Remove hardcoded `fuseMapping` array entirely
- Parent components (HomeBaseManual) pass the data prop

### 2C. AskAI buildHomeContext() → Remove Demo Data

**Current state:** Lines ~40-132 contain extensive hardcoded demo property data as fallback in the system prompt.

**Target state:** Build context entirely from PropertyContext data. If no data exists, the context says "No property data available yet" instead of fake data.

**Changes:**
- Import `useProperty` and `useAuth`
- Build context from `activeProperty` + `homeData`:
  ```
  Property: {address, sqft, bedrooms, bathrooms, year_built, lot_size}
  Rooms: [{name, type, sqft, floor}...]
  Appliances: [{name, brand, model, type}...]
  Systems: [{type, data}...]
  Contacts: [{name, company, trade, phone}...]
  Emergency: [{type, location, instructions}...]
  ```
- If a section is empty, say "No [section] data recorded yet"
- Never show fake addresses, fake WiFi passwords, fake room dimensions

### 2D. Onboarding Stubs

**Property Lookup:** Currently returns fake success. Two options:
1. Remove the button entirely (YAGNI — users enter data manually or via Homer document upload)
2. Wire to a free public records API

**Decision:** Remove the "Look Up Property" button. Homer document processing (Sub-project 3) is the real path for auto-populating property data from appraisals. The lookup button creates false expectations. Replace with helper text: "Upload an appraisal or inspection to Homer to auto-fill property details."

**Document Extraction:** Currently shows "coming soon" toast. This gets replaced by Homer in Sub-project 3. For now, update the toast to say "Use Homer (Ask AI) to extract data from documents" with a link.

### 2E. Integrations Stubs

**Connected Services (4):** Energy Provider, Smart Thermostat, Smart Home, Water Utility. All show "Coming Soon."

**Decision:** Keep as "Coming Soon" — these require OAuth integrations with third-party APIs (Nest, Hue, utility APIs) that are genuinely out of scope. They're not broken, they're planned features. No change needed.

**PDF Upload:** Gets wired to Homer in Sub-project 3. The button becomes functional when Homer backend exists.

---

## Sub-project 3: Homer AI Backend

**Fully specified in:** `docs/superpowers/specs/2026-04-12-homer-ai-doc-processing-design.md`

Summary of what gets built:
1. Supabase Edge Function `chat-with-homer` → Claude API (claude-sonnet-4-5-20250514)
2. System prompt with full home context
3. Tool-use for structured data extraction (update_property, add_appliance, add_room, etc.)
4. AskAI.jsx reconnected to real Edge Function
5. File upload → Supabase Storage → Claude vision processing
6. Confirmation cards in chat UI (user approves before data writes)
7. Integrations page PDF upload → Homer extraction → energy bill record
8. Supabase Storage bucket `homebase-uploads` with RLS

**Prerequisites:**
- Anthropic API key stored as Supabase Edge Function secret
- Supabase Storage bucket created
- `documents` table already has `file_url` and `type` columns; only `extracted_data` (jsonb) needs to be added

---

## Execution Order

```
Sub-project 1 (Supabase Migration)     ← No blockers, do first
  1A. ContactsAccounts → Supabase
  1B. Projects → Supabase
  1C. AskAI chat history → Supabase
  1D. Admin cleanup
  1E. Missing delete functions

Sub-project 2 (Stub Cleanup)           ← No blockers, do second
  2A. AddInfoModal saves data
  2B. FuseBoxDiagram reads real data
  2C. AskAI remove demo context
  2D. Onboarding stub updates
  2E. Integrations stub updates (minimal)

Sub-project 3 (Homer AI)               ← Needs API key + Edge Function infra
  Per existing approved spec
```

## What's NOT Changing

- Authentication flow — fully working
- Database schema (no new tables needed) — all 17 tables exist, only 1 column addition (`extracted_data` on documents)
- Supabase RLS policies — already complete
- Navigation hierarchy — just fixed
- HomeBaseManual chapters — just fixed to dynamic data
- HouseModel3D — already prop-driven
- Manual energy bill entry — already works on Integrations page
- Login page — fully functional
- Insights page — read-only, already works

## Success Criteria

1. **Zero localStorage dependencies** — every user-created record persists to Supabase
2. **Every button does something** — no "Coming Soon" on features that have backend support
3. **No demo data shown** for real properties (FuseBoxDiagram, AskAI context)
4. **Data survives** cache clear, device switch, browser change
5. **Homer answers questions** about the user's actual home (Sub-project 3)
6. **Document upload → extraction → property update** works end-to-end (Sub-project 3)
