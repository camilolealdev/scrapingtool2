import type { ScrapeResult } from '../types/index';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
const WA_RE = /wa\.me\/(\d+)/;
const IG_RE = /instagram\.com\/([a-zA-Z0-9_.]{2,30})/;
const IG_NOISE = new Set(['p', 'reel', 'stories', 'explore', 'accounts', 'about', 'static', 'legal']);

export async function bingWebSearch(
  apiKey: string,
  query: string,
  count = 10,
  market = 'es-CO'
): Promise<ScrapeResult[]> {
  const url = `/api/bing?q=${encodeURIComponent(query)}&count=${count}&mkt=${market}&responseFilter=Webpages`;
  const resp = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Bing API ${resp.status}: ${err.slice(0, 200)}`);
  }

  const data = await resp.json();
  const pages: any[] = data?.webPages?.value ?? [];

  return pages.map((page) => {
    const text = `${page.name || ''} ${page.snippet || ''}`;
    const emails = Array.from(new Set(text.match(EMAIL_RE) ?? [])).slice(0, 2) as string[];
    const phones = Array.from(new Set(
      (text.match(PHONE_RE) ?? []).filter((p: string) => p.replace(/\D/g, '').length >= 7)
    )).slice(0, 2) as string[];
    const waMatch = text.match(WA_RE);
    const igMatch = (page.url as string)?.match(IG_RE);
    const igHandle = igMatch && !IG_NOISE.has(igMatch[1]) ? `@${igMatch[1]}` : '';

    return {
      name: page.name || page.url,
      website: page.url,
      email: emails[0] || '',
      phone: phones[0] || '',
      whatsapp: waMatch ? `https://wa.me/${waMatch[1]}` : '',
      instagram: igHandle,
      notes: `[Bing] ${(page.snippet || '').slice(0, 150)}`,
    } as ScrapeResult;
  }).filter(l => l.name && l.website);
}
