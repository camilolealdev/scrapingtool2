# Ledger de revisión – plan docs/superpowers/plans/2026-10-12-project-review-plan.md
Task 0: complete (00-skill-map.md)
Task 1: complete salvo confirmación de rotación y npm audit (01-security.md)
Task 2: complete salvo tsc (02-architecture.md)
Task 5: complete salvo prueba en interfaz (05-extraction.md)
Task 3: hecha solo con documentación; falta prueba con claves (03-providers.md)
Task 6: complete, requiere revisión legal (06-legal-risk.md)
Pendientes: T4 (Supabase), T7 (app en marcha), T8 (medidas del VPS), T9 (síntesis)
Nota: 03 y 06 las escribió una segunda sesión en paralelo, no un archivo misterioso. Su contenido viene de búsquedas web, no de pruebas con claves.
Ruling: sin commit ni cambios de código (revisión de solo lectura) — costo si es incorrecto: ninguno, todo queda sin versionar en docs/review/.
Final review: self-review (no hay revisor independiente); decide el dueño si basta.
2026-10-22: tres agentes (A dorks/builders, B OSS, C n8n) -> 09-sintesis-tres-agentes.md. Verificado: css_first ausente en Scrapling 0.5; yalwa en 8+7 listas; NOISE_EMAIL_DOMAINS no bloquea sitios. Sin cambios de código. Diseño n8n aún sin aprobar.

## 2026-10-22 — Ejecución (sin commit)
- dorking_scraper.py: 17x css_first -> _first() (css()[0]); EMAIL_RE con lookbehind (1M chars = 0.055 s); yalwa.* retirado de 7 listas. Compila. Backup: /tmp/dorking_scraper.bak.py (VM del usuario).
- dorkBuilder.ts: yalwa.* retirado (0 restantes). tsc NO ejecutado (falta node_modules).
- n8n: carpeta "Leads OSINT" + workflow "🟠 PENDIENTE | Leads - Orquestador" (id iZBpF83ZxFmReaEH), sin publicar, sin credenciales. No se tocó ningún flujo Bot Meta.
- Pendiente: lead-worker + compose, builderDetect, Firecrawl v2 en frontend, dedupe_key UNIQUE en Supabase, prueba con Scrapling real.

## 2026-10-22 (2) — worker, builderDetect, Firecrawl v2, errores
- Hallazgo: con `pip install scrapling` a secas, Scrapling NO se activa (falta curl_cffi); hay que usar `scrapling[fetchers]`. `duckduckgo_search` -> `ddgs` (import con fallback). `page.html` no existe en 0.5: ahora se usa `html_content` (antes los regex de WA/IG/FB/builder corrían sobre texto plano).
- Prueba real (servidor local + Scrapling 0.5): email, tel, WA, IG, builder=wix, score 95. Buscadores reales NO probados: el proxy de la VM cloud devuelve 403.
- Nuevo: src/utils/builderSignatures.json + builderDetect.ts + detect_builder() (7/7 casos + cabeceras); worker/ (FastAPI, 401/422/429 probados), docker-compose.leads.yml (mem_limit 1g/512m, sin puertos), supabase/migrations/20261022_leads_dedupe.sql (NO aplicada: proyecto pausado, restore denegado).
- Firecrawl: api/firecrawl.js -> /v2; firecrawlClient.ts lee data.web (compat v1).
- n8n: carpeta Leads OSINT con Orquestador (iZBpF83ZxFmReaEH) y Manejador de errores (gbNSbyrkAbCIBv3g) + data table leads_osint_errores. Sin publicar.

## 2026-10-22 (3) — Supabase y merge
- Proyecto Supabase scrapingtool2 (mjsyudxqqtvnqzdqmpbo) reactivado; esquema aplicado (4 tablas, RLS on, 0 advisors). OJO: scripts/setup-db.mjs apunta a OTRO proyecto (ngefsbjlplcpetpysgti); no se usa.
- Orquestador n8n alineado (run_id, source_provider, URL Supabase). errorWorkflow NO asignado: el manejador debe publicarse primero.
- Prueba real de dorks: pendiente en el PC del usuario (scripts/dork_smoke.py); la VM no llega a buscadores.
