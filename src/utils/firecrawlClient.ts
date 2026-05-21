import type { ScrapeResult } from '../types/index';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
const WA_RE = /wa\.me\/(\d+)/;
const IG_RE = /instagram\.com\/([a-zA-Z0-9_.]{2,30})/;
const IG_NOISE = new Set(['p', 'reel', 'stories', 'explore', 'accounts', 'about', 'static', 'legal']);

export async function firecrawlSearch(
  apiKey: string,
  query: string,
  limit = 10
): Promise<ScrapeResult[]> {
  const resp = await fetch('/api/firecrawl', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: 'search',
      query,
      limit,
      scrapeOptions: { formats: ['markdown'] },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Firecrawl API ${resp.status}: ${err.slice(0, 200)}`);
  }

  const data = await resp.json();
  const results: any[] = data?.data ?? [];

  return results.map((r) => {
    const text = `${r.title || ''} ${r.description || ''} ${r.markdown || ''}`;
    const emails = Array.from(new Set(text.match(EMAIL_RE) ?? [])).slice(0, 2) as string[];
    const phones = Array.from(new Set(
      (text.match(PHONE_RE) ?? []).filter((p: string) => p.replace(/\D/g, '').length >= 7)
    )).slice(0, 2) as string[];
    const waMatch = text.match(WA_RE);
    const igMatch = text.match(IG_RE);
    const igHandle = igMatch && !IG_NOISE.has(igMatch[1]) ? `@${igMatch[1]}` : '';

    return {
      name: r.title || r.url,
      website: r.url,
      email: emails[0] || '',
      phone: phones[0] || '',
      whatsapp: waMatch ? `https://wa.me/${waMatch[1]}` : '',
      instagram: igHandle,
      notes: `[Firecrawl] ${(r.description || '').slice(0, 150)}`,
    } as ScrapeResult;
  }).filter(l => l.name && l.website);
}
