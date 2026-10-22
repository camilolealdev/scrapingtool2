import signatures from './builderSignatures.json';

export interface BuilderResult {
  id: string;
  label: string;
  confidence: 'alta' | 'baja';
}

const MAX_CHARS = 300_000;

/** Detecta el constructor web a partir del HTML (y cabeceras opcionales). Firmas en builderSignatures.json, compartidas con Python. */
export function detectBuilder(
  html: string,
  headers: Record<string, string> = {},
  url = ''
): BuilderResult | null {
  const hay = (url + '\n' + Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n' + html.slice(0, MAX_CHARS)).toLowerCase();
  for (const s of signatures) {
    if (s.strong.some((x) => hay.includes(x))) return { id: s.id, label: s.label, confidence: 'alta' };
  }
  for (const s of signatures) {
    if (s.weak.some((x) => hay.includes(x))) return { id: s.id, label: s.label, confidence: 'baja' };
  }
  return null;
}
