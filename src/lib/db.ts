import { supabase } from './supabase';
import type { ScrapeResult } from '../types';

export async function createSession(params: {
  niche: string;
  city: string;
  zone: string;
  region: string;
  aiProvider: string;
  scrapeMode: string;
  query: string;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('search_sessions')
    .insert({
      niche: params.niche,
      city: params.city,
      zone: params.zone,
      region: params.region,
      ai_provider: params.aiProvider,
      scrape_mode: params.scrapeMode,
      query: params.query,
      status: 'running',
    })
    .select('id')
    .single();
  if (error) { console.error('[DB] createSession:', error.message); return null; }
  return data.id;
}

export async function closeSession(sessionId: string | null, resultsCount: number, durationMs: number) {
  if (!supabase || !sessionId) return;
  await supabase
    .from('search_sessions')
    .update({ results_count: resultsCount, duration_ms: durationMs, status: 'completed' })
    .eq('id', sessionId);
}

export async function insertLeads(sessionId: string | null, leads: ScrapeResult[], provider: string) {
  if (!supabase || !leads.length) return;
  const rows = leads.map(l => ({
    session_id: sessionId ?? null,
    source_provider: provider,
    name: l.name || null,
    phone: l.phone || null,
    email: l.email || null,
    whatsapp: l.whatsapp || null,
    website: l.website || null,
    instagram: l.instagram || null,
    address: l.address || null,
    lat: l.lat ?? null,
    lng: l.lng ?? null,
    notes: l.notes || null,
  }));
  const { error } = await supabase.from('leads').insert(rows);
  if (error) console.error('[DB] insertLeads:', error.message);
}

export async function insertLog(
  sessionId: string | null,
  message: string,
  level: 'info' | 'warn' | 'error' = 'info'
) {
  if (!supabase) return;
  await supabase.from('scrape_logs').insert({ session_id: sessionId ?? null, message, level });
}

export async function insertError(provider: string, query: string, errorMessage: string, context?: object) {
  if (!supabase) return;
  await supabase.from('error_events').insert({
    provider,
    query,
    error_message: errorMessage,
    context: context ?? null,
  });
}
