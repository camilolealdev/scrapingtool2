const baseUrl = (process.env.LEADS_API_URL || 'http://localhost:3000/api/leads').replace(/\/$/, '');
const niche = process.env.LEADS_SMOKE_NICHE || 'dentistas';
const country = process.env.LEADS_SMOKE_COUNTRY || 'Colombia';
const timeoutMs = Number(process.env.LEADS_SMOKE_TIMEOUT_MS || 120000);

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
try {
  const start = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ niche, country, city: process.env.LEADS_SMOKE_CITY || 'Bogotá', method: 'places', limit: 3 }),
    signal: controller.signal,
  });
  const job = await start.json();
  if (start.status !== 202 || !job.session_id || !job.access_token) {
    throw new Error(`Inicio inválido (${start.status}): ${JSON.stringify(job)}`);
  }
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const status = await fetch(`${baseUrl}?session_id=${encodeURIComponent(job.session_id)}`, {
      headers: { 'x-leads-session-token': job.access_token },
      signal: controller.signal,
    });
    const data = await status.json();
    if (!status.ok) throw new Error(`Polling inválido (${status.status}): ${JSON.stringify(data)}`);
    const state = data.session?.status;
    console.log(JSON.stringify({ status: state, results_count: data.session?.results_count ?? 0 }));
    if (state === 'completed' || state === 'partial') {
      console.log(`SMOKE_OK session=${job.session_id} leads=${data.leads?.length ?? 0}`);
      process.exit(0);
    }
    if (['failed', 'cancelled'].includes(state)) throw new Error(`Job terminó en ${state}`);
  }
  throw new Error('Timeout esperando el job');
} finally {
  clearTimeout(timer);
}
