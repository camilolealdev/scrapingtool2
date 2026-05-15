import type { ScrapeResult } from '../types/index';

const BRAVE_BASE = import.meta.env.DEV ? '/api/brave' : 'https://api.search.brave.com';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
const WA_RE = /wa\.me\/(\d+)/;
const IG_RE = /instagram\.com\/([a-zA-Z0-9_.]{2,30})/;
const IG_NOISE = new Set(['p', 'reel', 'stories', 'explore', 'accounts', 'about', 'static', 'legal']);

export async function braveWebSearch(
  apiKey: string,
  query: string,
  count = 10,
  country = 'CO'
): Promise<ScrapeResult[]> {
  const url = `${BRAVE_BASE}/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&country=${country}&search_lang=es&ui_lang=es`;
  const resp = await fetch(url, {
    headers: {
      'X-Subscription-Token': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Brave API ${resp.status}: ${err.slice(0, 200)}`);
  }

  const data = await resp.json();
  const results: any[] = data?.web?.results ?? [];

  return results.map((r) => {
    const text = `${r.title || ''} ${r.description || ''}`;
    const emails = Array.from(new Set(text.match(EMAIL_RE) ?? [])).slice(0, 2) as string[];
    const phones = Array.from(new Set(
      (text.match(PHONE_RE) ?? []).filter((p: string) => p.replace(/\D/g, '').length >= 7)
    )).slice(0, 2) as string[];
    const waMatch = text.match(WA_RE);
    const igMatch = (r.url as string)?.match(IG_RE);
    const igHandle = igMatch && !IG_NOISE.has(igMatch[1]) ? `@${igMatch[1]}` : '';

    return {
      name: r.title || r.url,
      website: r.url,
      email: emails[0] || '',
      phone: phones[0] || '',
      whatsapp: waMatch ? `https://wa.me/${waMatch[1]}` : '',
      instagram: igHandle,
      notes: `[Brave] ${(r.description || '').slice(0, 150)}`,
    } as ScrapeResult;
  }).filter(l => l.name && l.website);
}
