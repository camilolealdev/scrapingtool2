import { getNeon } from './_neon.js';
import { createHash, randomUUID } from 'node:crypto';

const json = (res, status, body) => res.status(status).json(body);
const authorizedIngest = req => process.env.LEADS_INGEST_KEY && req.headers['x-leads-ingest-key'] === process.env.LEADS_INGEST_KEY;
const sessionToken = req => String(req.headers['x-leads-session-token'] || '');
const hashToken = token => createHash('sha256').update(token).digest('hex');
const requestWindows = globalThis.__leadsRequestWindows || (globalThis.__leadsRequestWindows = new Map());
function rateLimited(req, limit = 20, bucket = 'public') {
  const key = `${bucket}:${String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown').slice(0, 80)}`;
  const now = Date.now();
  for (const [k, value] of requestWindows) if (now - value.started > 120_000) requestWindows.delete(k);
  const current = requestWindows.get(key);
  if (!current || now - current.started > 60_000) { requestWindows.set(key, { started: now, count: 1 }); return false; }
  current.count += 1;
  return current.count > limit;
}

export default async function handler(req, res) {
  let createdSessionId = null;
  res.setHeader('Access-Control-Allow-Origin', process.env.LEADS_ALLOWED_ORIGIN || 'null');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-leads-ingest-key, x-leads-session-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (Number(req.headers['content-length'] || 0) > 1024 * 1024) return json(res, 413, { error: 'Solicitud demasiado grande' });
    const mode = String(req.query?.mode || '');
    const limit = mode === 'ingest' ? 120 : mode === 'close' ? 30 : req.method === 'GET' ? 60 : 20;
    if (rateLimited(req, limit, mode || req.method.toLowerCase())) return json(res, 429, { error: 'Demasiadas solicitudes' });
    const sql = getNeon();

    if (req.method === 'POST' && mode === 'ingest') {
      if (!authorizedIngest(req)) return json(res, 401, { error: 'ingest no autorizado' });
      const { session_id: sessionId, rows } = req.body || {};
      if (!/^[0-9a-f-]{36}$/i.test(String(sessionId || '')) || !Array.isArray(rows)) return json(res, 400, { error: 'session_id y rows son obligatorios' });
      const validRows = rows.filter(r => r && typeof r.dedupe_key === 'string' && r.dedupe_key.trim()).slice(0, 100);
      for (const r of validRows) {
        const numeric = (value, min, max) => {
          if (value === null || value === undefined || value === '') return null;
          const n = Number(value);
          return Number.isFinite(n) && n >= min && n <= max ? n : null;
        };
        const categories = Array.isArray(r.categories) ? r.categories.map(String) : null;
        const openingHours = Array.isArray(r.opening_hours) ? r.opening_hours.map(String) : null;
        await sql`insert into public.leads
          (session_id, run_id, source_provider, source_url, captured_at, opt_out, dedupe_key,
           name, phone, email, whatsapp, website, instagram, facebook, linkedin, tiktok, youtube, x,
           address, place_id, rating, reviews_count, categories, opening_hours, google_maps_url,
           intent_score, lat, lng, notes, builder, niche, country, city)
          values (${sessionId}, ${r.run_id || sessionId}, ${r.source_provider || null}, ${r.source_url || null},
           coalesce(${r.captured_at || null}::timestamptz, now()), coalesce(${r.opt_out ?? false}, false), ${r.dedupe_key},
           ${r.name || null}, ${r.phone || null}, ${r.email || null}, ${r.whatsapp || null}, ${r.website || null},
           ${r.instagram || null}, ${r.facebook || null}, ${r.linkedin || null}, ${r.tiktok || null}, ${r.youtube || null}, ${r.x || null},
           ${r.address || null}, ${r.place_id || null}, ${numeric(r.rating, 0, 5)}, ${numeric(r.reviews_count, 0, 1000000000)}, ${categories},
           ${openingHours}, ${r.google_maps_url || null}, ${numeric(r.intent_score, 0, 100)}, ${numeric(r.lat, -90, 90)}, ${numeric(r.lng, -180, 180)},
           ${r.notes || null}, ${r.builder || null}, ${r.niche || null}, ${r.country || null}, ${r.city || null})
          on conflict (dedupe_key) do update set
            session_id=excluded.session_id, source_provider=excluded.source_provider,
            source_url=excluded.source_url, captured_at=excluded.captured_at, opt_out=excluded.opt_out,
            name=excluded.name, phone=excluded.phone, email=excluded.email, whatsapp=excluded.whatsapp,
            website=excluded.website, instagram=excluded.instagram, facebook=excluded.facebook,
            linkedin=excluded.linkedin, tiktok=excluded.tiktok, youtube=excluded.youtube, x=excluded.x,
            address=excluded.address, place_id=excluded.place_id, rating=excluded.rating,
            reviews_count=excluded.reviews_count, categories=excluded.categories,
            opening_hours=excluded.opening_hours, google_maps_url=excluded.google_maps_url,
            intent_score=excluded.intent_score, lat=excluded.lat, lng=excluded.lng,
            notes=excluded.notes, builder=excluded.builder, niche=excluded.niche,
            country=excluded.country, city=excluded.city`;
      }
      return json(res, 200, { ok: true, count: validRows.length, skipped: rows.length - validRows.length });
    }

    if (req.method === 'POST' && mode === 'close') {
      if (!authorizedIngest(req)) return json(res, 401, { error: 'close no autorizado' });
      const { session_id: sessionId, count = 0, status = 'completed', duration_ms: durationMs = null } = req.body || {};
      if (!/^[0-9a-f-]{36}$/i.test(String(sessionId || ''))) return json(res, 400, { error: 'session_id inválido' });
      const safeStatus = ['completed', 'partial', 'failed', 'cancelled'].includes(status) ? status : null;
      const safeCount = Number(count);
      if (!safeStatus || !Number.isInteger(safeCount) || safeCount < 0 || safeCount > 100000) return json(res, 400, { error: 'estado o contador inválido' });
      const updated = await sql`update public.search_sessions set status=${safeStatus}, results_count=${safeCount}, duration_ms=${Number.isFinite(Number(durationMs)) ? Number(durationMs) : null} where id=${sessionId} returning id`;
      if (!updated[0]) return json(res, 404, { error: 'sesión no encontrada' });
      return json(res, 200, { ok: true, status: safeStatus, count: safeCount });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!String(body.niche || '').trim() || !String(body.country || '').trim()) {
        return json(res, 400, { error: 'niche y country son obligatorios' });
      }
      if (!process.env.LEADS_N8N_URL) return json(res, 503, { error: 'backend de jobs no configurado' });
      const sessionId = randomUUID();
      createdSessionId = sessionId;
      const accessToken = randomUUID() + randomUUID();
      await sql`insert into public.search_sessions
        (id, access_token, niche, city, zone, region, ai_provider, scrape_mode, query, status, expires_at)
        values (${sessionId}, ${hashToken(accessToken)}, ${String(body.niche).trim().slice(0, 120)}, ${String(body.city || '').trim().slice(0, 80)},
          ${String(body.zone || '').trim().slice(0, 80)}, ${String(body.country).trim().slice(0, 60)},
          'leads-api', 'backend', ${String(body.query || body.niche).trim().slice(0, 500)}, 'queued', now() + interval '24 hours')`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const n8n = await fetch(process.env.LEADS_N8N_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.LEADS_N8N_KEY ? { 'x-leads-key': process.env.LEADS_N8N_KEY } : {}) },
        body: JSON.stringify({ ...body, session_id: sessionId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const result = await n8n.json().catch(() => ({}));
      const accepted = result && (result.session_id === sessionId || result.status === 'queued');
      if (!n8n.ok || result?.error || !accepted) {
        await sql`update public.search_sessions set status='failed' where id=${sessionId}`;
        return json(res, n8n.ok ? 502 : n8n.status, { error: result.error || 'n8n no confirmó el trabajo' });
      }
      return json(res, 202, { ...result, session_id: sessionId, access_token: accessToken, status: 'queued' });
    }

    if (req.method === 'GET') {
      const id = String(req.query?.session_id || '').trim();
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { error: 'session_id inválido' });
      const token = sessionToken(req);
      if (!token) return json(res, 401, { error: 'token de sesión requerido' });
      const sessions = await sql`select id,created_at,niche,city,zone,region,ai_provider,scrape_mode,query,status,results_count,duration_ms from public.search_sessions where id=${id} and access_token=${hashToken(token)} and expires_at > now() limit 1`;
      if (!sessions[0]) return json(res, 404, { error: 'sesión no encontrada' });
      const leads = await sql`select * from public.leads where session_id=${id} order by captured_at desc`;
      return json(res, 200, { session: sessions[0] || null, leads });
    }
    return json(res, 405, { error: 'Método no permitido' });
  } catch (error) {
    console.error('[leads-api]', error);
    try {
      const id = String(createdSessionId || req.body?.session_id || '');
      const sql = getNeon();
      if (/^[0-9a-f-]{36}$/i.test(id)) await sql`update public.search_sessions set status='failed' where id=${id}`;
      await sql`insert into public.error_events (provider, query, error_message, context) values ('leads-api', ${String(req.body?.query || req.body?.niche || '').slice(0, 500)}, ${String(error?.message || error).slice(0, 1000)}, ${JSON.stringify({ session_id: id || null })}::jsonb)`;
    } catch {}
    return json(res, 500, { error: 'Error interno del backend' });
  }
}
