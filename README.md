# HomeBase OS

Personal home operating system — track property details, systems, appliances, paint records, projects, and more. AI-powered document ingestion (appraisals, inspections, disclosures) auto-populates your home profile.

## Stack

- **Frontend:** React + Vite, deployed on Vercel
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Storage)
- **AI:** Claude (via Supabase Edge Function) for document extraction

## Local Dev

```bash
npm install
cp .env.example .env.local  # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Deploy

### Frontend (Vercel)

Push to the main branch. Vercel auto-deploys.

Required env vars on Vercel project:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Edge Function (Supabase)

Deploys the `process-document` function used by onboarding to extract
property data from uploaded documents.

```bash
./scripts/deploy-edge-function.sh
```

Requires `ANTHROPIC_API_KEY` as a Supabase secret:
```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref jhmhgyijwhimshxgupon
```
