import type { LeadRecord, ScrapeResult } from '../types';

const compact = (value: string | undefined) => (value || '').trim();

export function normalizePhone(value?: string): string {
  return compact(value).replace(/\D/g, '');
}

export function normalizeEmail(value?: string): string {
  return compact(value).toLowerCase().split(',')[0].trim();
}

export function normalizeDomain(value?: string): string {
  const input = compact(value);
  if (!input) return '';
  try {
    const url = new URL(input.includes('://') ? input : `https://${input}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return input.toLowerCase().replace(/^www\./, '').split('/')[0];
  }
}

export function buildDedupeKey(lead: ScrapeResult): string {
  const placeId = compact(lead.place_id);
  if (placeId) return `place:${placeId}`;

  const phone = normalizePhone(lead.phone || lead.whatsapp);
  if (phone) return `phone:${phone}`;

  const domain = normalizeDomain(lead.website);
  if (domain) return `domain:${domain}`;

  const email = normalizeEmail(lead.email);
  if (email) return `email:${email}`;

  const identity = [lead.name, lead.address].map(v => compact(v).toLowerCase()).filter(Boolean).join('|');
  return `name:${identity || 'unknown'}`;
}

export function toLeadRecord(
  lead: ScrapeResult,
  sourceProvider: string,
  capturedAt = new Date().toISOString(),
): LeadRecord {
  return {
    ...lead,
    name: compact(lead.name) || 'Sin nombre',
    source_provider: lead.source_provider || sourceProvider,
    source_url: lead.source_url || lead.google_maps_url,
    captured_at: lead.captured_at || capturedAt,
    dedupe_key: lead.dedupe_key || buildDedupeKey(lead),
  };
}
