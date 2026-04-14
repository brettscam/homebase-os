import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Run: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { fileBase64, mediaType, documentType, textContent, existingData } = await req.json()

    const content: any[] = []

    if (fileBase64 && mediaType) {
      if (mediaType === 'application/pdf') {
        content.push({
          type: 'document',
          source: { type: 'base64', media_type: mediaType, data: fileBase64 },
        })
      } else if (mediaType.startsWith('image/')) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: fileBase64 },
        })
      }
    }

    if (textContent) {
      content.push({ type: 'text', text: `Document content:\n\n${textContent}` })
    }

    if (content.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No document content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const existingStr = existingData ? JSON.stringify(existingData, null, 2) : '{}'

    content.push({
      type: 'text',
      text: `You are a property data extraction expert. Extract ALL property information from this ${documentType || 'document'}.

Current known property data (may be empty or partial):
${existingStr}

Instructions:
1. Extract every property detail you can find in the document
2. For rooms: include name, type, dimensions if available, floor level
3. For systems: include brand, model, age/install date, condition
4. For fields that conflict with existing data, note the conflict
5. For ambiguous information, add it to the unknowns list

Return a JSON object with this exact structure:
{
  "property": {
    "address": "", "city": "", "state": "", "zip": "",
    "yearBuilt": "", "sqft": "", "lotSize": "", "stories": "",
    "bedrooms": "", "bathrooms": ""
  },
  "rooms": [
    { "name": "Room Name", "type": "bedroom|bathroom|kitchen|living|dining|garage|office|basement|attic|laundry|other", "sqft": "", "dimensions": "LxW", "floor": "1" }
  ],
  "appliances": [
    { "name": "Display Name", "type": "refrigerator|dishwasher|washer|dryer|oven|microwave|other", "brand": "", "model": "" }
  ],
  "systems": {
    "hvac": { "type": "", "brand": "", "model": "", "installDate": "", "filterSize": "" },
    "waterHeater": { "type": "tank|tankless|hybrid", "brand": "", "model": "", "capacity": "", "installDate": "" },
    "electrical": { "amperage": "", "circuits": "", "panelLocation": "" },
    "plumbing": { "mainShutoffLocation": "", "mainShutoffInstructions": "" }
  },
  "exterior": {
    "roof": { "type": "", "material": "", "age": "", "condition": "" },
    "siding": { "material": "", "condition": "" },
    "gutters": { "material": "", "condition": "" }
  },
  "unknowns": ["List anything ambiguous or that could not be determined"],
  "conflicts": [
    { "field": "field.name", "existing": "old value", "extracted": "new value", "note": "explanation" }
  ],
  "summary": "Brief 1-2 sentence summary of what was extracted from this document"
}

IMPORTANT:
- Only include fields that are actually mentioned or implied by the document
- Leave out fields entirely if not found (do not include empty strings for missing data)
- If rooms have dimensions, include them in "LxW" format (e.g. "20x16")
- For rooms, identify the floor/level when possible
- Return ONLY the JSON object, no markdown code fences`,
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      return new Response(
        JSON.stringify({ error: `Anthropic API error (${response.status})` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await response.json()
    const responseText = result.content?.[0]?.text || ''

    let extracted
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      extracted = JSON.parse(jsonStr)
    } catch {
      extracted = { error: 'Failed to parse extraction results', raw: responseText }
    }

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('process-document error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
