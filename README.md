# HomeBase OS

Personal home operating system — track property details, systems, appliances, paint records, projects, and more. AI-powered document ingestion (appraisals, inspections, disclosures) auto-populates your home profile.

## Stack

- **Frontend:** React + Vite, auto-deployed on Vercel
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **AI:** Claude (via Supabase Edge Function) for document extraction

## Local Dev

```bash
npm install
cp .env.example .env.local  # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Deployment

Everything auto-deploys from `main`:

- **Frontend → Vercel**: auto-deploys on push to main. Env vars required on the Vercel project: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Edge Functions → Supabase**: auto-deploys on push to main via `.github/workflows/deploy-supabase-functions.yml` whenever anything under `supabase/functions/**` changes.

### One-time setup

**GitHub Actions secret** (for edge function deploys):
- `SUPABASE_ACCESS_TOKEN` — a Supabase PAT from https://supabase.com/dashboard/account/tokens
  Add it at: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

**Supabase secret** (read by the edge function at runtime):
- `ANTHROPIC_API_KEY` — already set on the project.
