import type { ScrapeResult } from '../types';

// Legacy browser-side AI providers are intentionally not persisted directly.
// Neon writes are performed by the server-side Leads API and n8n only.
export async function createSession(_params: { niche: string; city: string; zone: string; region: string; aiProvider: string; scrapeMode: string; query: string }): Promise<string | null> { return null; }
export async function closeSession(_sessionId: string | null, _resultsCount: number, _durationMs: number) { return; }
export async function insertLeads(_sessionId: string | null, _leads: ScrapeResult[], _provider: string) { return; }
export async function insertLog(_sessionId: string | null, _message: string, _level: 'info' | 'warn' | 'error' = 'info') { return; }
export async function insertError(_provider: string, _query: string, _errorMessage: string, _context?: object) { return; }
