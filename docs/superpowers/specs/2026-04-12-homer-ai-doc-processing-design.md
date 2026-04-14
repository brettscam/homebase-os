# Homer AI, Document Processing & Data Cleanup
**Date:** 2026-04-12  
**Status:** Draft

## Problem Statement

HomeBase OS has a complete UI but critical backend gaps:
1. Homer (Ask AI) chat returns a stub message — no LLM connected
2. Document uploads do nothing — no extraction or processing
3. The 3D Floor Plan shows hardcoded "Miller Residence" demo data for all properties
4. No file storage — documents/photos aren't persisted anywhere
5. Energy bill upload button is disabled ("coming soon")

The user needs a fully operational app where uploading an appraisal automatically extracts property data, Homer can answer questions and process documents, and all demo/placeholder data is replaced with real property data.

## Architecture

```
Browser (React) 
  → Supabase Storage (file uploads)
  → Supabase Edge Function "chat-with-homer" → Claude API (claude-sonnet-4-5-20250514)
  → Supabase Database (all property data)
```

### Why Supabase Edge Function?
The Anthropic API key must stay server-side. The Edge Function acts as a secure proxy — the frontend never sees the key.

## Components

### 1. Supabase Edge Function: `chat-with-homer`

**Input:**
```json
{
  "message": "string",
  "images": ["base64 string or storage URL"],
  "conversation_history": [{"role": "user|assistant", "content": "..."}],
  "home_context": { /* property, rooms, appliances, systems, etc. */ },
  "property_id": "uuid"
}
```

**Behavior:**
- Builds a system prompt with the full home context (property specs, rooms, appliances, systems, utilities, contacts, paint colors, emergency info)
- Sends to Claude API with tool_use enabled
- Claude can respond with text AND propose structured updates via tools

**Tools available to Claude:**
- `update_property(fields)` — update sqft, year_built, bedrooms, bathrooms, lot_size, etc.
- `add_appliance(name, brand, model, serial_number, type, install_date)` 
- `add_room(name, type, floor, sqft)`
- `add_energy_bill(utility_type, billing_period_start, billing_period_end, amount_dollars, usage_amount, usage_unit)`
- `add_contact(name, company, trade, phone, email)`
- `add_document(name, type, source, notes)` — record that a document was processed
- `update_systems(type, data)` — update HVAC, plumbing, electrical, water heater info

**Output:**
```json
{
  "message": "string (Claude's text response)",
  "tool_calls": [
    { "tool": "update_property", "args": { "sqft": 1850, "year_built": 1965 } },
    { "tool": "add_appliance", "args": { ... } }
  ]
}
```

**The frontend handles tool_calls** — shows confirmation cards, user approves, frontend writes to Supabase tables using existing data store functions. Claude never writes directly to the database.

### 2. Supabase Storage: `homebase-uploads` bucket

**Structure:**
```
homebase-uploads/
  {user_id}/
    {property_id}/
      documents/   (appraisals, inspections, warranties)
      bills/       (energy bills, utility statements)
      photos/      (appliance photos, property photos)
```

**RLS Policy:** Users can only read/write files under their own `{user_id}/` path.

**Integration:** After upload, the file URL is passed to Homer for processing. The URL is also stored in the `documents` table for reference.

### 3. Homer Chat (AskAI.jsx) — Reconnected

**Changes to existing UI:**
- Replace stub response (line ~294) with real Edge Function call
- Add file attachment button to message input bar (camera icon + file picker)
- Accept: images (jpg, png, heic), PDFs
- When user attaches a file:
  1. Upload to Supabase Storage
  2. Convert to base64 (for Claude vision) or extract text (for PDFs)
  3. Send to Edge Function with the message
- When Claude returns tool_calls, render **confirmation cards** inline in the chat:
  ```
  Homer wants to update your property:
  ┌─────────────────────────────┐
  │ Square Footage: 1,850 sq ft │
  │ Year Built: 1965            │
  │ Bedrooms: 3                 │
  │ [Apply Changes]  [Skip]     │
  └─────────────────────────────┘
  ```
- User clicks "Apply Changes" → frontend calls existing upsert functions
- Conversation history persisted to `chat_conversations` table (already exists)

### 4. Document Processing Flow

When a user uploads a document (appraisal, inspection, survey, bill):

1. **Upload** → Supabase Storage → get public URL
2. **Send to Homer** → Edge Function → Claude with vision
3. **Claude extracts** structured data using tools (property specs, systems, appliances)
4. **Confirmation cards** shown to user
5. **User approves** → data written to appropriate tables
6. **Document record** saved to `documents` table with:
   - `file_url` (Supabase Storage URL)
   - `type` (appraisal, inspection, bill, warranty, photo)
   - `source` (uploaded by user)
   - `extracted_data` (JSON of what was extracted)
   - `property_id`

### 5. Energy Bill Upload

Two entry points:
- **Integrations page**: The currently-disabled upload button becomes functional. Opens a file picker, uploads the bill image/PDF, sends to Homer for extraction, creates energy_bill record after confirmation.
- **Homer chat**: User can drop a bill photo in chat and Homer processes it.

### 6. Demo Data Cleanup — HouseModel3D

**Current problem:** `src/components/house/HouseModel3D.jsx` has hardcoded:
- "The Miller Residence"
- 2,847 sq ft, 4 Bed, 3.5 Bath
- Hardcoded room names and layouts
- Hardcoded emergency shutoff positions

**Fix:** The component receives property data as props from the parent page (HomeBaseManual.jsx). Replace all hardcoded values with prop-driven data:
- Property name from `activeProperty.address` or `activeProperty.name`
- Sqft, beds, baths from `activeProperty`
- Room list from `homeData.rooms`
- Remove hardcoded "Miller" references entirely

If no data exists for a field, show "Not set" or hide the section — never show fake demo data.

## What's NOT Changing

- **Contacts page** — already fully functional
- **Manual entry for energy bills** — already works on Integrations page
- **Project management** — already working
- **Authentication** — working (auth lock fix deployed)
- **Multi-property management** — Admin page working

## Database Changes

**documents table — add columns:**
- `file_url` (text) — Supabase Storage URL
- `extracted_data` (jsonb) — what Claude extracted
- `type` (text) — appraisal, inspection, bill, warranty, photo, survey

**No new tables needed.** All existing tables (properties, rooms, appliances, systems, energy_bills, contacts, documents, chat_conversations) are sufficient.

## Security

- Anthropic API key stored as Supabase Edge Function secret (never in frontend)
- Edge Function validates the user's Supabase auth JWT before processing
- Supabase Storage RLS restricts file access to the owning user
- Claude cannot write to the database — it only proposes changes via tool_calls
- The frontend applies changes using the user's authenticated Supabase session

## Success Criteria

1. User can chat with Homer and get intelligent answers about their home
2. User can upload an appraisal/inspection → Homer extracts data → user confirms → property updated
3. User can upload an energy bill photo → Homer extracts amount/dates → bill record created
4. User can upload appliance photos → Homer identifies and adds appliance info
5. No demo/placeholder data shown for real properties
6. All uploaded files are persisted in Supabase Storage
7. All existing features (contacts, manual bill entry, projects) continue working
