# PRD: Contacts & Accounts + Admin Pages

## Overview

Two new pages for HomeBase OS:
1. **Contacts & Accounts** - Consolidated page with service providers, utility accounts, and key contacts. Grouped by category with filter/sub-tabs.
2. **Admin** - Owner-only property management (multi-property, data export, transfer).

### Decisions Made
- Contacts + Utilities = **one consolidated page** with grouping/sub-tabs
- Contacts are **shared across properties** (same plumber for all your rentals)
- Admin page is **owner-only** (not visible to tenants or contractors)
- Tenant view = future work (stripped-down read-only of key components)

---

## 1. Contacts & Accounts Page

### Purpose
One place for every person you call and every account you pay. Service providers, utility accounts, and key contacts - grouped by category. Emergency view pulls from this data (no more hardcoded contacts).

### Page Structure

**Sub-tabs / Filter Groups:**
- **All** - Everything
- **Service Providers** - Plumber, electrician, HVAC, handyman, etc.
- **Utilities** - Electric, gas, water, internet, trash, etc.
- **Emergency** - Contacts flagged as emergency (shown in Emergency view)

### Data Model: Service Provider
```
{
  id: string,
  type: 'provider',
  name: string,              // "Mike's Plumbing" or "Mike Rodriguez"
  company: string,           // Company name (if name is a person)
  trade: enum,               // plumber | electrician | hvac | handyman | landscaper | painter | roofer | general_contractor | pest_control | cleaning | locksmith | other
  phone: string,
  email: string,
  website: string,
  address: string,
  rating: 1-5,               // Personal rating
  isEmergency: boolean,      // Show in Emergency view
  isFavorite: boolean,       // Pin to top
  notes: string,
  jobs: [                    // Past work history
    {
      id: string,
      date: string,
      description: string,   // "Fixed leaking kitchen faucet"
      cost: number,
      notes: string,
    }
  ],
  // Multi-property: shared across all properties by default
  sharedAcrossProperties: true,
  createdAt: timestamp,
  lastContactedAt: timestamp,
}
```

### Data Model: Utility Account
```
{
  id: string,
  type: 'utility',
  utilityType: enum,         // electric | gas | water_sewer | internet | cable_tv | trash | phone | solar | home_warranty | alarm_monitoring | hoa | other
  provider: string,          // "PG&E", "Comcast", etc.
  accountNumber: string,
  phone: string,             // Provider support line
  website: string,           // Login URL
  loginEmail: string,        // Account login email
  avgMonthlyCost: number,    // Average monthly bill
  billingCycle: enum,        // monthly | quarterly | annually
  autopay: boolean,
  paymentMethod: string,     // "Visa ending 4242"
  contractEndDate: string,   // For internet/cable contracts
  notes: string,
  isActive: boolean,
  // Multi-property: utility accounts are per-property
  sharedAcrossProperties: false,
}
```

### Utility Type Icons & Colors
| Type | Icon | Color |
|------|------|-------|
| Electric | Zap | yellow-500 |
| Gas | Flame | orange-500 |
| Water/Sewer | Droplets | blue-500 |
| Internet | Wifi | indigo-500 |
| Trash | Trash2 | green-600 |
| Cable/TV | Tv | purple-500 |
| Phone | Phone | slate-500 |
| Solar | Sun | amber-500 |
| Home Warranty | Shield | emerald-500 |
| Alarm/Monitoring | Bell | red-500 |
| HOA | Building2 | stone-500 |

### Trade Type Icons & Colors
| Trade | Icon | Color |
|-------|------|-------|
| Plumber | Droplets | blue-600 |
| Electrician | Zap | yellow-600 |
| HVAC | Thermometer | cyan-600 |
| Handyman | Wrench | gray-600 |
| Landscaper | Trees | green-600 |
| Painter | Palette | pink-600 |
| Roofer | Home | slate-600 |
| General Contractor | HardHat | orange-600 |
| Pest Control | Bug | red-600 |
| Cleaning | Sparkles | violet-600 |
| Locksmith | Key | amber-600 |

### UI Layout

**Top section:**
- Page title: "Contacts & Accounts"
- "Add" button (dropdown: Add Provider | Add Utility Account)
- Search bar
- Sub-tab filter: All | Providers | Utilities | Emergency

**Summary bar (when Utilities tab active):**
- Total estimated monthly cost across all active utilities
- Number of accounts with autopay vs manual pay
- Contract renewals coming up (within 60 days)

**Card grid:**
- **Provider cards**: Name, trade badge (colored), phone (tap-to-call), star rating, last job + cost, emergency badge if flagged
- **Utility cards**: Provider name, utility type icon + badge, account number (masked `****4567`, tap to reveal), monthly cost, autopay status, copy button

**Detail slide-over (click a card):**
- Full contact/account details
- For providers: job history timeline, total spend, edit/delete
- For utilities: full account details, copy-to-clipboard, direct link to provider website, contract end date
- Edit / Delete buttons

**Empty state:**
- "Add your first contact" with quick-add suggestions:
  - Providers: "Plumber, Electrician, HVAC Tech, Handyman"
  - Utilities: "Electric, Gas, Water, Internet, Trash"

### Key Behaviors
- Emergency view (`HomeBase.jsx`) reads contacts where `isEmergency: true`
- Phone numbers = native `tel:` links
- Email = native `mailto:` links
- Account numbers masked by default, tap to reveal
- Copy buttons for account numbers, emails, phone numbers
- Contract end dates highlighted amber when within 60 days
- Providers shared across properties; utility accounts are per-property
- Ask AI knows all contacts + accounts:
  - "Who's my plumber?"
  - "What's my PG&E account number?"
  - "How much do I spend on utilities per month?"
  - "My water bill seems high, where's the shutoff?" (cross-references)

---

## 2. Admin Page (Owner Only)

### Purpose
Property management hub. Owner-only access. Manages multi-property switching, data, and (future) user access.

### Visibility
- **Owner**: Full access
- **Property Manager**: Can see Properties and Data tabs, not People management
- **Tenant**: Cannot see Admin page at all
- **Contractor**: Cannot see Admin page at all

### Sections

#### 2a. Properties
- List all properties with address, status badge (active | vacant | maintenance)
- **Add property**: Address, name, type (primary_residence | rental | vacation | commercial)
- **Switch active property**: Updates all other pages to show that property's data
- **Property status**: Toggle between active/vacant/maintenance
- **Delete property**: With confirmation dialog

#### 2b. People & Access (future-ready)
- Placeholder UI showing who has access to each property
- Invite button (disabled with "Coming soon" tooltip)
- Role badges: Owner, Manager, Tenant, Contractor
- Note: Full invite/role management is a future feature tied to auth

#### 2c. Data Management
- **Export**: Download all property data as JSON
- **Transfer**: Generate a transfer package for property sale
  - Buyer gets: manual data, contacts, utility accounts, project history
  - Buyer does NOT get: financial data, personal notes (configurable)
- **Import**: Link to Onboarding for document upload + AI extraction
- **Clear Data**: Reset property data (with double-confirmation)

#### 2d. Notifications (placeholder)
- Toggle switches (disabled, "Coming soon"):
  - Maintenance reminders
  - Warranty expiration alerts
  - Contract renewal reminders
  - Component replacement alerts

### Data Model
```
// Stored separately: localStorage key = 'homebase_admin'
{
  properties: [
    {
      id: string,
      name: string,           // "Mill Valley Home"
      type: enum,             // primary_residence | rental | vacation | commercial
      status: enum,           // active | vacant | maintenance
      address: string,
      dataStoreKey: string,   // localStorage key for this property's home data
      createdAt: timestamp,
    }
  ],
  activePropertyId: string,
  // Contacts stored here (shared across properties)
  contacts: [],              // Service providers (shared)
}
```

### UI Layout
- Accessed via gear icon in Layout header (not a main nav tab)
- **Tabbed sections**: Properties | People | Data
- **Properties tab**: Property cards in a grid, add button, status toggles
- **People tab**: Placeholder user list with "Coming soon" invite
- **Data tab**: Export/Transfer/Import/Clear buttons with descriptions

---

## Navigation Updates

**Current nav:** `Home | Manual | Projects`

**New nav:** `Home | Manual | Contacts | Projects`

- "Contacts" = the consolidated Contacts & Accounts page
- Admin = gear icon in top-right header area (next to Ask AI button)
- "Contacts" replaces having separate Contacts + Utilities tabs (consolidated)

---

## Data Store Changes

### homeDataStore.js additions
```js
// Add to defaultData:
contacts: [],              // Service providers (type: 'provider')
utilities: [],             // Utility accounts (type: 'utility')
```

### New admin store
```js
// Separate localStorage key: 'homebase_admin'
// Manages multi-property + shared contacts
{
  properties: [],
  activePropertyId: null,
  sharedContacts: [],      // Providers shared across properties
}
```

---

## Ask AI Context Updates

Extend the floating Ask AI panel to include:
```
SERVICE PROVIDERS:
- [trade]: [name], [phone], Last job: [description] ([cost], [date])

UTILITY ACCOUNTS:
- [type]: [provider], Account: [number], ~$[cost]/mo, Autopay: [yes/no]
```

---

## Build Order

1. **Contacts & Accounts page** - New page with both provider + utility CRUD
2. **Wire Emergency view** - Replace hardcoded contacts with live data
3. **Update Ask AI context** - Add contacts + utilities to AI prompt
4. **Update nav** - Add Contacts tab + Admin gear icon to Layout
5. **Admin page** - Properties list, data export, placeholder people/notifications
6. **Data store updates** - Add contacts/utilities to homeDataStore, create admin store
