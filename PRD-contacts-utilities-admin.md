# PRD: Contacts, Utilities & Admin Pages

## Overview

Three new pages for HomeBase OS that complete the home management experience:
1. **Contacts** - Unified service provider rolodex (feeds Emergency view)
2. **Utilities** - Utility account tracking and management
3. **Admin** - Property management and multi-property settings

---

## 1. Contacts Page (Service Provider Rolodex)

### Purpose
Single source of truth for every contractor, service provider, and emergency contact. The Emergency view on the Home page pulls from this data instead of hardcoded contacts.

### Data Model per Contact
```
{
  id: string,
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
  notes: string,             // Free text notes
  jobs: [                    // Past work history
    {
      id: string,
      date: string,
      description: string,   // "Fixed leaking kitchen faucet"
      cost: number,
      notes: string,
    }
  ],
  createdAt: timestamp,
  lastContactedAt: timestamp,
}
```

### UI Layout
- **Header**: "Service Providers" title + "Add Provider" button
- **Filter bar**: Filter by trade (dropdown chips), search by name
- **Card grid**: Each provider shows name, trade badge, phone (tap-to-call), rating stars, last job summary
- **Detail slide-over**: Full provider detail with job history, total spend, edit/delete
- **Empty state**: "Add your first provider" CTA with common trade suggestions

### Key Behaviors
- Emergency view (`HomeBase.jsx`) reads contacts where `isEmergency: true` instead of using hardcoded data
- Tap phone number = native tel: link
- Tap email = native mailto: link
- Job history tracks what they did + what it cost (useful for "how much did we pay last time?")
- Ask AI can reference contacts: "Who's my plumber?" / "How much did the last plumbing job cost?"

### Navigation
- Top nav tab: Home | Manual | **Contacts** | Projects | Utilities
- Or accessible from Emergency view: "Manage Providers" link

---

## 2. Utilities Page (Account Tracking)

### Purpose
Never dig through email for an account number again. All utility providers, account details, and billing info in one place.

### Data Model per Utility Account
```
{
  id: string,
  type: enum,                // electric | gas | water_sewer | internet | cable_tv | trash | phone | solar | home_warranty | alarm_monitoring | hoa | other
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
}
```

### Utility Type Defaults
Each type gets an icon and color:
| Type | Icon | Color |
|------|------|-------|
| Electric | Zap | yellow |
| Gas | Flame | orange |
| Water/Sewer | Droplets | blue |
| Internet | Wifi | indigo |
| Trash | Trash2 | green |
| Cable/TV | Tv | purple |
| Phone | Phone | slate |
| Solar | Sun | amber |
| Home Warranty | Shield | emerald |
| Alarm/Monitoring | Bell | red |
| HOA | Building2 | stone |

### UI Layout
- **Header**: "Utilities & Accounts" title + "Add Account" button
- **Monthly summary card**: Total estimated monthly cost across all utilities
- **Account cards**: Grid of cards, each showing provider logo/icon, account type badge, account number (masked by default, tap to reveal), monthly cost, auto-pay badge
- **Detail view**: Full account details, copy-to-clipboard for account numbers, direct link to provider website
- **Empty state**: Common utility type suggestions based on property location

### Key Behaviors
- Account numbers masked by default (`****4567`), tap/click to reveal
- Copy button for account numbers and login emails
- Quick-call button for provider support lines
- Monthly cost total shown at top
- Contract end dates highlighted when within 60 days (for negotiation timing)
- Ask AI integration: "What's my PG&E account number?" / "How much do I pay for internet?"

---

## 3. Admin Page (Property Management)

### Purpose
Property management hub for multi-property support. Designed for the property manager SKU but useful for single-property owners too.

### Sections

#### 3a. Properties
- List all properties with address, photo, status badge (active/vacant/maintenance)
- Add new property (address, name, type: primary_residence | rental | vacation | commercial)
- Switch active property (updates all other pages)
- Property transfer: generate a shareable link to transfer home data to new owner
- Delete property (with confirmation)

#### 3b. People & Access
- Invite users to a property (email invite)
- Role management:
  - **Owner**: Full access, can manage other users
  - **Property Manager**: Full access except billing/subscription
  - **Tenant**: View-only access to manual, emergency info, contacts. Cannot see financial data (costs, property values)
  - **Contractor**: Temporary access to specific sections (e.g., "share floor plan with contractor")
- View who has access to each property

#### 3c. Data Management
- **Import**: Upload documents for AI extraction (link to Onboarding)
- **Export**: Download all property data as JSON or PDF report
- **Transfer**: Generate a transfer package for property sale (buyer gets all home data)

#### 3d. Notifications (future-ready)
- Placeholder toggles for:
  - Maintenance reminders
  - Warranty expiration alerts
  - Contract renewal reminders
  - Component replacement alerts

### Data Model
```
{
  properties: [
    {
      id: string,
      name: string,           // "Mill Valley Home"
      type: enum,             // primary_residence | rental | vacation | commercial
      status: enum,           // active | vacant | maintenance
      address: string,
      dataStoreKey: string,   // localStorage key for this property's data
      createdAt: timestamp,
    }
  ],
  activePropertyId: string,
  users: [
    {
      id: string,
      email: string,
      name: string,
      role: enum,             // owner | manager | tenant | contractor
      propertyIds: string[],  // Which properties they can access
      invitedAt: timestamp,
    }
  ],
}
```

### UI Layout
- **Tabbed sections**: Properties | People | Data
- **Properties tab**: Property cards with switch/add/edit
- **People tab**: User list with role badges, invite button
- **Data tab**: Import/Export/Transfer buttons with file size estimates

---

## Navigation Updates

Current nav: `Home | Manual | Projects`

Proposed nav: `Home | Manual | Contacts | Projects | Utilities`

Admin/Settings accessible via a gear icon or user avatar in the top-right of the Layout header (not a main nav tab - it's not a daily-use page).

---

## Data Store Changes

Add to `homeDataStore.js`:
```js
contacts: [],           // Service provider rolodex
utilities: [],          // Utility accounts
```

New separate store for admin/multi-property:
```js
// homebase_admin (separate localStorage key)
{
  properties: [],
  activePropertyId: string,
  users: [],
}
```

---

## Ask AI Integration

The floating Ask AI panel context should be extended to include:
- Contact data: "Who's my plumber?" / "What's the electrician's number?"
- Utility data: "What's my internet account number?" / "How much do I spend on utilities monthly?"
- Cross-referencing: "My water bill seems high, where's the shutoff?" (combines utilities + emergency)

---

## Priority Order

1. **Contacts** - Highest impact, replaces hardcoded emergency data, daily utility
2. **Utilities** - High value, everyone scrambles for account numbers
3. **Admin** - Foundation for multi-property SKU, can start simple

---

## Open Questions

1. Should Contacts and Utilities be combined into one "Accounts" page with tabs, or stay as separate nav items?
2. For the property manager SKU: should each property have completely separate data stores, or share contacts across properties (e.g., same plumber for multiple rental units)?
3. Should the Admin page be visible to all users or only to Owner/Manager roles?
