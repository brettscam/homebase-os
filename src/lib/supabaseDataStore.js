import { supabase } from './supabase';

// ─── Property CRUD ──────────────────────────────────────────

export async function getActiveProperty(userId) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getUserProperties(userId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .abortSignal(controller.signal);

    if (error) throw error;
    return data || [];
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Properties query timed out — check Supabase connection and API keys');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function createProperty(userId, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ user_id: userId, ...propertyData })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProperty(propertyId, updates) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Rooms ──────────────────────────────────────────────────

export async function getRooms(propertyId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function upsertRoom(room) {
  const { data, error } = await supabase
    .from('rooms')
    .upsert(room, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoom(roomId) {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
}

// ─── Appliances ─────────────────────────────────────────────

export async function getAppliances(propertyId) {
  const { data, error } = await supabase
    .from('appliances')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function upsertAppliance(appliance) {
  const { data, error } = await supabase
    .from('appliances')
    .upsert(appliance, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAppliance(applianceId) {
  const { error } = await supabase.from('appliances').delete().eq('id', applianceId);
  if (error) throw error;
}

// ─── Systems ────────────────────────────────────────────────

export async function getSystems(propertyId) {
  const { data, error } = await supabase
    .from('systems')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data || [];
}

export async function upsertSystem(system) {
  const { data, error } = await supabase
    .from('systems')
    .upsert(system, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Paint Records ──────────────────────────────────────────

export async function getPaintRecords(propertyId) {
  const { data, error } = await supabase
    .from('paint_records')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function upsertPaintRecord(record) {
  const { data, error } = await supabase
    .from('paint_records')
    .upsert(record, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePaintRecord(recordId) {
  const { error } = await supabase.from('paint_records').delete().eq('id', recordId);
  if (error) throw error;
}

// ─── Smart Home ─────────────────────────────────────────────

export async function getSmartHome(propertyId) {
  const { data, error } = await supabase
    .from('smart_home')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data || [];
}

export async function upsertSmartHome(item) {
  const { data, error } = await supabase
    .from('smart_home')
    .upsert(item, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Emergency Info ─────────────────────────────────────────

export async function getEmergencyInfo(propertyId) {
  const { data, error } = await supabase
    .from('emergency_info')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data || [];
}

export async function upsertEmergencyInfo(item) {
  const { data, error } = await supabase
    .from('emergency_info')
    .upsert(item, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Exterior ───────────────────────────────────────────────

export async function getExterior(propertyId) {
  const { data, error } = await supabase
    .from('exterior')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data || [];
}

export async function upsertExterior(item) {
  const { data, error } = await supabase
    .from('exterior')
    .upsert(item, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Contacts ───────────────────────────────────────────────

export async function getContacts(propertyId) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('property_id', propertyId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function upsertContact(contact) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert(contact, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContact(contactId) {
  const { error } = await supabase.from('contacts').delete().eq('id', contactId);
  if (error) throw error;
}

// ─── Utilities ──────────────────────────────────────────────

export async function getUtilities(propertyId) {
  const { data, error } = await supabase
    .from('utilities')
    .select('*')
    .eq('property_id', propertyId)
    .order('type');

  if (error) throw error;
  return data || [];
}

export async function upsertUtility(utility) {
  const { data, error } = await supabase
    .from('utilities')
    .upsert(utility, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUtility(utilityId) {
  const { error } = await supabase.from('utilities').delete().eq('id', utilityId);
  if (error) throw error;
}

// ─── Energy Bills (Insights) ────────────────────────────────

export async function getEnergyBills(propertyId) {
  const { data, error } = await supabase
    .from('energy_bills')
    .select('*')
    .eq('property_id', propertyId)
    .order('billing_period_end', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createEnergyBill(bill) {
  const { data, error } = await supabase
    .from('energy_bills')
    .insert(bill)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEnergyBill(billId) {
  const { error } = await supabase.from('energy_bills').delete().eq('id', billId);
  if (error) throw error;
}

// ─── Documents ──────────────────────────────────────────────

export async function getDocuments(propertyId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertDocument(doc) {
  const { data, error } = await supabase
    .from('documents')
    .upsert(doc, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(docId) {
  const { error } = await supabase.from('documents').delete().eq('id', docId);
  if (error) throw error;
}

// ─── Projects ───────────────────────────────────────────────

export async function getProjects(propertyId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_quotes(*), project_vendors(*)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(projectId) {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw error;
}

// ─── Project Quotes ─────────────────────────────────────────

export async function upsertProjectQuote(quote) {
  const { data, error } = await supabase
    .from('project_quotes')
    .upsert(quote, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectQuote(quoteId) {
  const { error } = await supabase.from('project_quotes').delete().eq('id', quoteId);
  if (error) throw error;
}

// ─── Integrations ───────────────────────────────────────────

export async function getIntegrations(propertyId) {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function upsertIntegration(integration) {
  const { data, error } = await supabase
    .from('integrations')
    .upsert(integration, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIntegration(integrationId) {
  const { error } = await supabase.from('integrations').delete().eq('id', integrationId);
  if (error) throw error;
}

// ─── Chat Conversations ─────────────────────────────────────

export async function getChatConversations(userId) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertChatConversation(convo) {
  const { data, error } = await supabase
    .from('chat_conversations')
    .upsert(convo, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChatConversation(convoId) {
  const { error } = await supabase.from('chat_conversations').delete().eq('id', convoId);
  if (error) throw error;
}

// ─── Full Home Data Loader ──────────────────────────────────
// Loads all data for a property in one call (for dashboard, etc.)

export async function loadFullHomeData(propertyId) {
  const keys = [
    'rooms', 'appliances', 'systems', 'paintRecords', 'smartHome',
    'emergencyInfo', 'exterior', 'contacts', 'utilities', 'documents',
    'energyBills', 'projects', 'integrations',
  ];
  const fetchers = [
    getRooms(propertyId),
    getAppliances(propertyId),
    getSystems(propertyId),
    getPaintRecords(propertyId),
    getSmartHome(propertyId),
    getEmergencyInfo(propertyId),
    getExterior(propertyId),
    getContacts(propertyId),
    getUtilities(propertyId),
    getDocuments(propertyId),
    getEnergyBills(propertyId),
    getProjects(propertyId),
    getIntegrations(propertyId),
  ];

  const results = await Promise.allSettled(fetchers);
  const data = {};
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      data[keys[i]] = result.value;
    } else {
      console.warn(`Failed to load ${keys[i]}:`, result.reason?.message || result.reason);
      data[keys[i]] = Array.isArray(result.value) ? [] : null;
    }
  });
  return data;
}

// ─── Compatibility Layer ────────────────────────────────────
// Converts between the old localStorage format and the new Supabase format.
// Used during migration to minimize changes to existing page components.

export function systemsArrayToLegacy(systemsArray) {
  const legacy = {
    hvac: { brand: '', model: '', type: '', installDate: '', filterSize: '', thermostat: '' },
    waterHeater: { brand: '', model: '', capacity: '', type: '', installDate: '' },
    electrical: { amperage: '', circuits: '', panelLocation: '' },
    plumbing: { mainShutoffLocation: '', mainShutoffInstructions: '' },
  };

  for (const sys of systemsArray) {
    const typeMap = {
      hvac: 'hvac',
      water_heater: 'waterHeater',
      electrical: 'electrical',
      plumbing: 'plumbing',
    };
    const key = typeMap[sys.type];
    if (key && sys.data) {
      legacy[key] = { ...legacy[key], ...sys.data };
    }
  }

  return legacy;
}

export function legacySystemsToArray(legacySystems, propertyId, existingSystems) {
  const typeMap = {
    hvac: 'hvac',
    waterHeater: 'water_heater',
    electrical: 'electrical',
    plumbing: 'plumbing',
  };

  return Object.entries(legacySystems).map(([key, data]) => {
    const dbType = typeMap[key];
    const existing = existingSystems.find(s => s.type === dbType);
    return {
      ...(existing ? { id: existing.id } : {}),
      property_id: propertyId,
      type: dbType,
      data,
    };
  });
}
