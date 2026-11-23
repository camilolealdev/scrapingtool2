import type { ScrapeResult } from '../types';

const API_URL = (import.meta.env.VITE_LEADS_API_URL || '/api/leads').replace(/\/$/, '');

export interface LeadJobResponse { session_id: string; access_token: string; status: string; }
export interface LeadJobStatus { session: { status?: string; results_count?: number } | null; leads: ScrapeResult[]; }

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { window.clearTimeout(timer); }
}

export async function startLeadJob(payload: {
  niche: string; country: string; city?: string; zone?: string; query?: string; method?: string; limit?: number;
}): Promise<LeadJobResponse> {
  const response = await fetchWithTimeout(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API Leads respondió ${response.status}`);
  if (typeof data.session_id !== 'string' || typeof data.access_token !== 'string' || data.status !== 'queued') {
    throw new Error('Respuesta inválida del backend de Leads');
  }
  return data;
}

export async function getLeadJob(sessionId: string, accessToken: string): Promise<LeadJobStatus> {
  const response = await fetchWithTimeout(`${API_URL}?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { 'x-leads-session-token': accessToken },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `No se pudo consultar el job (${response.status})`);
  if (!data.session || !Array.isArray(data.leads)) throw new Error('Respuesta inválida al consultar el job');
  return data;
}
