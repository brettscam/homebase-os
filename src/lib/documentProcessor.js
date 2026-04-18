import { supabase } from './supabase';
import {
  updateProperty, upsertRoom, upsertAppliance, upsertSystem, upsertExterior,
  getRooms, getAppliances, getSystems,
} from './supabaseDataStore';

// Map our extracted system keys to db system types
const SYSTEM_TYPE_MAP = {
  hvac: 'hvac',
  waterHeater: 'water_heater',
  electrical: 'electrical',
  plumbing: 'plumbing',
};

// ─── File Reading Helpers ──────────────────────────────────────────────

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1]; // strip data:...;base64, prefix
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function getMediaType(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const types = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    txt: 'text/plain',
  };
  return types[ext] || file.type || 'application/octet-stream';
}

// ─── AI Document Processing ────────────────────────────────────────────

export async function processDocumentFile(file, documentType, existingData = {}) {
  const mediaType = getMediaType(file);
  let payload;

  if (mediaType === 'text/plain') {
    const text = await readFileAsText(file);
    payload = { textContent: text, documentType, existingData };
  } else {
    const base64 = await readFileAsBase64(file);
    payload = { fileBase64: base64, mediaType, documentType, existingData };
  }

  const { data, error } = await supabase.functions.invoke('process-document', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Document processing failed');
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function processDocumentText(text, documentType, existingData = {}) {
  const payload = { textContent: text, documentType, existingData };

  const { data, error } = await supabase.functions.invoke('process-document', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Document processing failed');
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

// ─── Fallback: Basic Pattern Extraction ────────────────────────────────
// Works without AI — extracts common property fields from plain text using regex.

export function extractBasicPatterns(text) {
  const result = { property: {}, rooms: [], unknowns: [], summary: '' };
  const found = [];

  // Square footage
  const sqftMatch = text.match(/(?:living\s*area|gross\s*living|total\s*(?:living\s+)?(?:area|sq\.?\s*ft)|(?:above\s*grade))[:\s]*([0-9,]+)\s*(?:sq\.?\s*(?:ft)?|SF)?/i)
    || text.match(/([0-9,]+)\s*(?:sq\.?\s*ft|square\s*feet|SF)\b/i);
  if (sqftMatch) {
    result.property.sqft = sqftMatch[1].replace(/,/g, '');
    found.push(`${result.property.sqft} sq ft`);
  }

  // Bedrooms
  const bedMatch = text.match(/(\d+)\s*(?:bed(?:room)?s?)\b/i)
    || text.match(/(?:bed(?:room)?s?)[:\s]*(\d+)/i);
  if (bedMatch) {
    result.property.bedrooms = bedMatch[1];
    found.push(`${bedMatch[1]} bedrooms`);
  }

  // Bathrooms
  const bathMatch = text.match(/(\d+\.?\d*)\s*(?:bath(?:room)?s?)\b/i)
    || text.match(/(?:bath(?:room)?s?)[:\s]*(\d+\.?\d*)/i);
  if (bathMatch) {
    result.property.bathrooms = bathMatch[1];
    found.push(`${bathMatch[1]} bathrooms`);
  }

  // Year built
  const yearMatch = text.match(/(?:year\s*built|built\s*(?:in)?|constructed|year\s*of\s*construction)[:\s]*(\d{4})/i);
  if (yearMatch) {
    result.property.yearBuilt = yearMatch[1];
    found.push(`built ${yearMatch[1]}`);
  }

  // Stories
  const storyMatch = text.match(/(\d+(?:\.\d)?)\s*(?:stor(?:y|ies))/i)
    || text.match(/(?:stories|floors)[:\s]*(\d+(?:\.\d)?)/i);
  if (storyMatch) {
    result.property.stories = storyMatch[1];
    found.push(`${storyMatch[1]} stories`);
  }

  // Lot size
  const lotMatch = text.match(/(?:lot\s*size|site\s*area|land\s*area)[:\s]*([0-9,.]+)\s*(acres?|sq\.?\s*ft|SF)?/i);
  if (lotMatch) {
    result.property.lotSize = lotMatch[1].replace(/,/g, '') + (lotMatch[2] ? ` ${lotMatch[2]}` : '');
    found.push(`lot ${result.property.lotSize}`);
  }

  // Room dimensions (e.g., "Living Room  20 x 16" or "Master Bedroom: 14x12")
  const roomPattern = /(?:^|\n)\s*([A-Z][A-Za-z\s/]+?)\s*(?:[-–:]|\s{2,})\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/gm;
  let roomMatch;
  while ((roomMatch = roomPattern.exec(text)) !== null) {
    const name = roomMatch[1].trim();
    // Filter out non-room matches
    if (name.length > 2 && name.length < 40 && !/total|gross|net|area|site/i.test(name)) {
      result.rooms.push({
        name,
        dimensions: `${roomMatch[2]}x${roomMatch[3]}`,
        _source: 'document',
      });
    }
  }

  if (found.length > 0) {
    result.summary = `Extracted: ${found.join(', ')}${result.rooms.length ? `, ${result.rooms.length} rooms with dimensions` : ''}`;
  } else {
    result.summary = 'No property data patterns found in this text. Try uploading the original PDF for better results.';
  }

  return result;
}

// ─── Merge Extracted Data ──────────────────────────────────────────────
// Merges AI-extracted data into the existing onboarding form data.
// Only overwrites empty fields unless force=true.

export function mergeExtractedData(existing, extracted) {
  const merged = structuredClone(existing);

  // Merge property fields
  if (extracted.property) {
    if (!merged.property) merged.property = {};
    for (const [key, value] of Object.entries(extracted.property)) {
      if (value && !merged.property[key]) {
        merged.property[key] = String(value);
      }
    }
  }

  // Merge rooms
  if (extracted.rooms?.length) {
    if (!merged.rooms) merged.rooms = [];
    for (const room of extracted.rooms) {
      const exists = merged.rooms.some(r =>
        r.name?.toLowerCase() === room.name?.toLowerCase()
      );
      if (!exists) {
        merged.rooms.push({
          ...room,
          id: crypto.randomUUID(),
          _source: 'document',
        });
      }
    }
  }

  // Merge appliances
  if (extracted.appliances?.length) {
    if (!merged.appliances) merged.appliances = [];
    for (const app of extracted.appliances) {
      const exists = merged.appliances.some(a =>
        a.name?.toLowerCase() === app.name?.toLowerCase() ||
        (a.type?.toLowerCase() === app.type?.toLowerCase() && a.brand?.toLowerCase() === app.brand?.toLowerCase())
      );
      if (!exists) {
        merged.appliances.push({
          ...app,
          id: crypto.randomUUID(),
          _source: 'document',
        });
      }
    }
  }

  // Merge systems
  if (extracted.systems) {
    if (!merged.systems) merged.systems = {};
    for (const [sysKey, sysData] of Object.entries(extracted.systems)) {
      if (!sysData || typeof sysData !== 'object') continue;
      if (!merged.systems[sysKey]) merged.systems[sysKey] = {};
      for (const [field, value] of Object.entries(sysData)) {
        if (value && !merged.systems[sysKey][field]) {
          merged.systems[sysKey][field] = String(value);
        }
      }
    }
  }

  // Merge exterior
  if (extracted.exterior) {
    if (!merged.exterior) merged.exterior = {};
    for (const [extKey, extData] of Object.entries(extracted.exterior)) {
      if (!extData || typeof extData !== 'object') continue;
      if (!merged.exterior[extKey]) merged.exterior[extKey] = {};
      for (const [field, value] of Object.entries(extData)) {
        if (value && !merged.exterior[extKey][field]) {
          merged.exterior[extKey][field] = String(value);
        }
      }
    }
  }

  // Track sources
  if (!merged._sources) merged._sources = {};
  const docFields = [];
  if (extracted.property) docFields.push(...Object.keys(extracted.property).filter(k => extracted.property[k]));
  merged._sources.documents = [...new Set([...(merged._sources.documents || []), ...docFields])];

  return merged;
}

// ─── Apply Extracted Data Directly to Supabase ─────────────────────────
// Used post-onboarding (AddInfoModal) — writes extracted data straight to the DB.
// Returns a summary of what was written.

export async function applyExtractedToSupabase(propertyId, extracted) {
  if (!propertyId) throw new Error('propertyId is required');

  const summary = {
    propertyFields: [],
    roomsAdded: 0,
    appliancesAdded: 0,
    systemsUpdated: [],
    exteriorUpdated: [],
  };

  // 1. Update property fields (only fill empty ones)
  if (extracted.property) {
    const { data: currentProp } = await supabase
      .from('properties').select('*').eq('id', propertyId).single();

    const fieldMap = {
      yearBuilt: 'year_built', sqft: 'sqft', lotSize: 'lot_size',
      stories: 'stories', bedrooms: 'bedrooms', bathrooms: 'bathrooms',
      address: 'address', city: 'city', state: 'state', zip: 'zip',
    };
    const updates = {};
    for (const [camel, snake] of Object.entries(fieldMap)) {
      const v = extracted.property[camel];
      if (v && !currentProp?.[snake]) {
        updates[snake] = String(v);
        summary.propertyFields.push(snake);
      }
    }
    if (Object.keys(updates).length > 0) {
      await updateProperty(propertyId, updates);
    }
  }

  // 2. Add rooms (skip duplicates by name)
  if (extracted.rooms?.length) {
    const existingRooms = await getRooms(propertyId);
    const existingNames = new Set(existingRooms.map(r => r.name?.toLowerCase()));
    for (const room of extracted.rooms) {
      if (!room.name || existingNames.has(room.name.toLowerCase())) continue;
      await upsertRoom({
        property_id: propertyId,
        name: room.name,
        type: room.type || '',
        floor: room.floor || '',
        sqft: room.sqft || '',
        dimensions: room.dimensions || '',
        notes: '',
      });
      summary.roomsAdded += 1;
    }
  }

  // 3. Add appliances (skip duplicates by name+brand)
  if (extracted.appliances?.length) {
    const existingApps = await getAppliances(propertyId);
    const existingKeys = new Set(
      existingApps.map(a => `${a.name?.toLowerCase()}::${a.brand?.toLowerCase() || ''}`)
    );
    for (const app of extracted.appliances) {
      if (!app.name && !app.type) continue;
      const key = `${(app.name || app.type).toLowerCase()}::${(app.brand || '').toLowerCase()}`;
      if (existingKeys.has(key)) continue;
      await upsertAppliance({
        property_id: propertyId,
        name: app.name || app.type,
        type: app.type || '',
        brand: app.brand || '',
        model: app.model || '',
        install_date: app.installDate || '',
      });
      summary.appliancesAdded += 1;
    }
  }

  // 4. Systems (merge into existing jsonb)
  if (extracted.systems) {
    const existingSystems = await getSystems(propertyId);
    for (const [sysKey, sysData] of Object.entries(extracted.systems)) {
      if (!sysData || typeof sysData !== 'object') continue;
      const hasData = Object.values(sysData).some(v => v && String(v).trim());
      if (!hasData) continue;
      const dbType = SYSTEM_TYPE_MAP[sysKey] || sysKey;
      const existing = existingSystems.find(s => s.type === dbType);
      const mergedData = { ...(existing?.data || {}) };
      for (const [k, v] of Object.entries(sysData)) {
        if (v && !mergedData[k]) mergedData[k] = String(v);
      }
      await upsertSystem({
        ...(existing ? { id: existing.id } : {}),
        property_id: propertyId,
        type: dbType,
        data: mergedData,
      });
      summary.systemsUpdated.push(dbType);
    }
  }

  // 5. Exterior (merge into existing jsonb)
  if (extracted.exterior) {
    const { data: existingExt } = await supabase
      .from('exterior').select('*').eq('property_id', propertyId);
    for (const [extKey, extData] of Object.entries(extracted.exterior)) {
      if (!extData || typeof extData !== 'object') continue;
      const hasData = Object.values(extData).some(v => v && String(v).trim());
      if (!hasData) continue;
      const existing = (existingExt || []).find(e => e.type === extKey);
      const mergedData = { ...(existing?.data || {}) };
      for (const [k, v] of Object.entries(extData)) {
        if (v && !mergedData[k]) mergedData[k] = String(v);
      }
      await upsertExterior({
        ...(existing ? { id: existing.id } : {}),
        property_id: propertyId,
        type: extKey,
        data: mergedData,
      });
      summary.exteriorUpdated.push(extKey);
    }
  }

  return summary;
}
