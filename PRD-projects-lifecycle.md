# PRD: Projects — Home Project Lifecycle Manager

## Overview

Transform the Projects page from a maintenance tracker into a full **project lifecycle manager** — from identifying a need, to finding vendors, collecting quotes, making informed decisions, and tracking completion. The platform leverages everything it knows about the home so homeowners are informed, prepared, and never get taken advantage of.

---

## Core Build (v1)

### 1. Project Types

**Auto-Generated (Known Projects)**
- Sourced from home data: aging roof, expiring warranties, HVAC filter due, water heater lifespan, etc.
- Show as suggested cards: "Your roof was installed in 2018 — typical lifespan is 20-25 years. Start planning?"
- Linked to the component/system they relate to

**User-Created Projects**
- Homeowner adds manually: "Replace living room windows", "Remodel master bathroom", "Add deck"
- Categorized by type: Repair, Remodel, Upgrade, Maintenance, Addition
- Can link to specific rooms/systems from home data

### 2. Project Detail View

Each project has a lifecycle with phases:

```
Planning → Quoting → Comparing → In Progress → Complete
```

**Project Card Fields:**
- Title, description, category (Repair/Remodel/Upgrade/Maintenance/Addition)
- Linked room(s) / system(s) — auto-pulls relevant specs
- Priority: Urgent / Soon / Planned / Someday
- Budget range (optional)
- Target start date (optional)
- Status (auto-advances through lifecycle)
- Photos / notes

**Specs Panel (auto-populated):**
When a project links to a room or system, the relevant home data appears automatically:
- "Replace Living Room Windows" → shows current window specs (Andersen 400 Series, 42"w × 60"h, 2 units), room dimensions, photos
- "Redo Roof" → shows current roof material (GAF Timberline Asphalt), install date (2018), square footage
- This is what you hand to contractors — no more guessing

### 3. Vendor & Quote Workflow

**Linking Vendors:**
- Pull from Contacts page (existing providers) or add new ones
- "Recommended" badge for vendors you've used before with good ratings
- Track which vendors you've contacted per project

**Outreach Drafts:**
- Generate a draft email/message pre-filled with:
  - Project scope description
  - Relevant home specs (dimensions, current materials, quantities)
  - Specific asks (quote breakdown, timeline, warranty terms)
- Example: "Hi — I'm looking to replace 3 windows in my living room. Current windows are Andersen 400 Series double-hung, 42"w × 60"h rough openings. Looking for quotes on comparable or upgraded units. Please include: itemized material + labor, timeline, warranty terms, and whether permits are needed."
- Homeowner reviews/edits before sending

**Quote Storage:**
- Attach quotes (PDF, photo, or manual entry) to a project
- Structured fields per quote:
  - Vendor name (linked to contact)
  - Total price
  - Line items breakdown (materials, labor, permits, disposal)
  - Timeline estimate
  - Warranty offered
  - Valid until date
  - Notes / red flags

**Quote Comparison View:**
- Side-by-side table of all quotes for a project
- Highlights: lowest price, best warranty, fastest timeline
- Flags missing items: "Vendor B didn't include permit costs" or "Vendor C has no warranty listed"
- Cost per unit calculations where applicable (e.g., price per window, price per sq ft)

### 4. Project Dashboard

**Views:**
- **Active** — projects currently in a lifecycle phase
- **Suggested** — auto-generated from home data (aging systems, upcoming maintenance)
- **Completed** — archive with final costs, vendor used, photos, rating

**Summary Cards:**
- Total active projects
- Total quoted spend (sum of accepted quotes)
- Upcoming deadlines
- Vendors awaiting response

---

## Future Premium Add-On: Project Copilot (v2 SKU)

> This is a separate paid tier layered on top of the core project lifecycle.

### What It Does

An AI copilot that rides alongside every project to make the homeowner smarter:

**"What to Ask" Checklists:**
- Auto-generated per project type
- Replacing windows? Ask about: Low-E glass options, argon fill, U-factor ratings, NFRC certification, lead paint abatement (pre-1978 homes), permit requirements, disposal of old windows, warranty on glass vs. frame vs. installation labor
- Roof replacement? Ask about: Ice & water shield, ventilation, flashing replacement, drip edge, nail pattern, manufacturer warranty vs. installer warranty, cleanup process
- Checklists are contextual to YOUR home (e.g., "Your home was built in 1987 — ask about asbestos testing before demo")

**Quote Analysis & Red Flags:**
- "This quote is 35% above the average for window replacement in your zip code"
- "Vendor didn't include permit costs — this typically runs $200-500 in your area"
- "No warranty mentioned on labor — industry standard is 1-2 years minimum"
- "The materials spec'd are a downgrade from what you currently have"

**Informed Negotiation:**
- "You have 3 quotes. The average is $X. You could ask Vendor A to match Vendor C's warranty terms."
- "Vendor B quoted $2,000 more but includes a 10-year labor warranty vs. 1-year. Worth considering."

**Follow-Up Prompts:**
- After receiving a quote: "Here are 3 clarifying questions to send back before deciding"
- During project: "Your contractor mentioned X — here's what that means and whether it's standard"

### Future Revenue Streams (v3+)

**Referral Marketplace:**
- Verified vendor directory by trade and area
- Vendors can opt into referral program
- HomeBase earns referral fee when a homeowner contacts/hires through the platform
- Vendor ratings from actual HomeBase users (verified projects, not anonymous reviews)

**Promoted Listings / Ads:**
- Contextual, non-intrusive: when a homeowner starts a "Replace HVAC" project, show 1-2 promoted local HVAC companies
- Clearly labeled as sponsored
- Only shown to homeowners actively in a quoting phase (high intent)

---

## Data Model

```javascript
// Added to homeDataStore or separate projectStore
project: {
  id: string,
  title: string,
  description: string,
  category: 'repair' | 'remodel' | 'upgrade' | 'maintenance' | 'addition',
  priority: 'urgent' | 'soon' | 'planned' | 'someday',
  status: 'planning' | 'quoting' | 'comparing' | 'in_progress' | 'complete',
  linkedRooms: string[],       // room IDs
  linkedSystems: string[],     // 'roof', 'hvac', 'windows', etc.
  budgetMin: number | null,
  budgetMax: number | null,
  targetStartDate: string | null,
  notes: string,
  vendors: [
    {
      contactId: string,       // links to Contacts page
      status: 'contacted' | 'quoted' | 'declined' | 'accepted',
      contactedDate: string,
    }
  ],
  quotes: [
    {
      id: string,
      vendorContactId: string,
      totalPrice: number,
      lineItems: [{ description: string, amount: number }],
      timelineWeeks: number | null,
      warrantyTerms: string,
      validUntil: string | null,
      attachmentUrl: string | null,  // stored PDF/photo
      notes: string,
      submittedDate: string,
    }
  ],
  acceptedQuoteId: string | null,
  actualCost: number | null,
  completedDate: string | null,
  rating: number | null,        // how did the project go? 1-5
  createdAt: string,
  updatedAt: string,
}
```

---

## Open Questions for Review

1. **Existing Projects page** — Replace entirely, or keep the maintenance/warranty tracker as a sub-tab ("Maintenance" alongside "Active Projects")?
2. **Email drafts** — Copy to clipboard for now, or integrate with mailto: links? (Full email integration = future)
3. **Quote entry** — Manual fields only for v1, or also support photo/PDF upload with AI extraction?
4. **Project templates** — Pre-built project templates per type (window replacement, roof, bathroom remodel) with common scope items and typical cost ranges? Or keep it freeform?

---

## Not In Scope (v1)
- Email send integration (copy/clipboard only)
- AI quote analysis (Copilot SKU)
- "What to ask" checklists (Copilot SKU)
- Vendor marketplace / referrals (v3)
- Promoted listings (v3)
- Photo upload for quotes (v1 = manual entry + notes)
