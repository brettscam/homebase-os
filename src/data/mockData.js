import { BRAND } from "@/styles/brand";

export const PIPELINE_DATA = [
  {
    stage: "Lead",
    color: BRAND.purple,
    softColor: BRAND.purpleSoft,
    count: 12,
    value: "$284K",
    items: [
      { name: "Martinez Residence", company: "Martinez Family", value: "$42,000", days: 3 },
      { name: "Oakwood Fence Install", company: "Oakwood HOA", value: "$18,500", days: 7 },
      { name: "Downtown Loft Remodel", company: "Vertex Properties", value: "$96,000", days: 1 },
    ],
  },
  {
    stage: "Qualified",
    color: BRAND.blue,
    softColor: BRAND.blueSoft,
    count: 8,
    value: "$520K",
    items: [
      { name: "Hillcrest HVAC Overhaul", company: "Hillcrest Medical", value: "$134,000", days: 5 },
      { name: "River Walk Landscaping", company: "City of Millbrook", value: "$67,000", days: 12 },
    ],
  },
  {
    stage: "Proposal Sent",
    color: BRAND.amber,
    softColor: BRAND.amberSoft,
    count: 5,
    value: "$312K",
    items: [
      { name: "Beacon St. Security System", company: "Beacon Condos", value: "$28,000", days: 4 },
      { name: "Elm Park AV Install", company: "Elm Park School", value: "$156,000", days: 8 },
    ],
  },
  {
    stage: "Won",
    color: BRAND.green,
    softColor: BRAND.greenSoft,
    count: 3,
    value: "$198K",
    items: [
      { name: "Sunset Ridge Build-Out", company: "Apex Development", value: "$142,000", days: 0 },
    ],
  },
];

export const TODAY_JOBS = [
  {
    id: "JOB-2026-0038",
    name: "Sunset Ridge Build-Out",
    site: "1420 Sunset Ridge Dr",
    crew: "Team Alpha",
    phase: "Foundation",
    progress: 35,
    status: "On Track",
  },
  {
    id: "JOB-2026-0035",
    name: "Beacon St. Security",
    site: "88 Beacon St, Unit 4",
    crew: "Team Bravo",
    phase: "Wiring",
    progress: 72,
    status: "On Track",
  },
  {
    id: "JOB-2026-0031",
    name: "River Walk Phase 2",
    site: "River Walk Park, Sec B",
    crew: "Team Charlie",
    phase: "Grading",
    progress: 15,
    status: "Delayed",
  },
];

export const METRICS = [
  { label: "Active Jobs", value: "14", change: "+2", trend: "up" },
  { label: "Pipeline Value", value: "$1.31M", change: "+12%", trend: "up" },
  { label: "Win Rate", value: "68%", change: "+4%", trend: "up" },
  { label: "Due This Week", value: "7", change: "", trend: "neutral", sub: "milestones" },
];

export const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Pipeline" },
  { label: "Jobs" },
  { label: "Contacts" },
  { label: "Schedule" },
  { label: "Timeline" },
];

export const SCHEDULE_PHASES = [
  { name: "Site Prep", start: 0, width: 15, color: BRAND.blue },
  { name: "Foundation", start: 12, width: 20, color: BRAND.purple },
  { name: "Framing", start: 30, width: 25, color: BRAND.green },
  { name: "Electrical", start: 38, width: 18, color: BRAND.amber },
  { name: "Plumbing", start: 42, width: 16, color: BRAND.red },
  { name: "Drywall", start: 55, width: 20, color: BRAND.blue },
  { name: "Finishes", start: 72, width: 22, color: BRAND.green },
  { name: "Punch List", start: 90, width: 10, color: BRAND.purple },
];

export const SCHEDULE_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
