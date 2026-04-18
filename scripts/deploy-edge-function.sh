#!/usr/bin/env bash
# Deploy the process-document edge function to Supabase.
# Prereqs: You've run `supabase login` locally OR set SUPABASE_ACCESS_TOKEN.
# The ANTHROPIC_API_KEY secret should already be set (skip that step if so).

set -euo pipefail

PROJECT_REF="jhmhgyijwhimshxgupon"
FUNCTION_NAME="process-document"

cd "$(dirname "$0")/.."

echo "==> Linking to Supabase project ${PROJECT_REF}..."
npx supabase link --project-ref "${PROJECT_REF}"

echo ""
echo "==> Verifying ANTHROPIC_API_KEY secret is set..."
if npx supabase secrets list --project-ref "${PROJECT_REF}" 2>&1 | grep -q "ANTHROPIC_API_KEY"; then
  echo "    OK - ANTHROPIC_API_KEY is set"
else
  echo "    WARNING - ANTHROPIC_API_KEY not found."
  echo "    Set it with: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref ${PROJECT_REF}"
fi

echo ""
echo "==> Deploying edge function: ${FUNCTION_NAME}..."
npx supabase functions deploy "${FUNCTION_NAME}" --project-ref "${PROJECT_REF}" --no-verify-jwt

echo ""
echo "==> Done! Test it with:"
echo "    curl -X POST 'https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}' \\"
echo "      -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"textContent\":\"3 bedroom, 2 bath, 1850 sqft built 1998\",\"documentType\":\"test\"}'"
