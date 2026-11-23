# Revisión de producción — expansión Leads OSINT

Estado: implementación local y workflow n8n inactivo actualizado; no es una autorización de publicación.

## Ya integrado

- `LeadRecord`, normalización y `upsert` por `dedupe_key`.
- Neon preparado como almacenamiento principal mediante `@neondatabase/serverless`, API server-side y migración SQL; Supabase queda como origen legado hasta validar/exportar el proyecto.
- Worker FastAPI asíncrono (`POST /run` + `GET /jobs/{id}`), concurrencia 1 y clave interna.
- Google Places Text Search en el workflow como método `places`.
- Fallback worker para dorks/Scrapling; el stack Docker incluye gosom y el kit aislado.
- Dorks orientados a intención comercial, contacto y directorios; Bing retirado del runtime.
- Botones de ChatGPT, Perplexity, Claude y Qwen que abren la sesión del usuario. Las cuentas no se crean automáticamente.
- API `/api/leads` como fachada server-side: crea la sesión en Neon, dispara n8n y expone polling de estado/leads sin exponer la conexión.

## Bloqueadores antes de producción

1. Configurar `NEON_DATABASE_URL`, `LEADS_INGEST_KEY` y `LEADS_ALLOWED_ORIGIN` en Vercel; el proyecto Neon y el esquema ya fueron creados y validados, pero la base sigue vacía.
2. Configurar credenciales de n8n para Places, Firecrawl y `lead-worker`, además de `LEADS_N8N_URL`, `LEADS_N8N_KEY` y `LEADS_INGEST_KEY`; el workflow actualizado sigue inactivo.
3. Completar la llamada real a gosom/kit desde n8n o un adaptador interno. El worker actual no persiste jobs fuera de memoria: un reinicio pierde el estado.
4. Medir VPS (`free -m`, `nproc`, disco y `docker stats`) y fijar límites/alertas. Maps debe mantenerse en concurrencia 1.
5. Rotar y retirar cualquier secreto que haya quedado en historial o builds; las claves `VITE_*` no deben contener secretos de producción.
6. Integrar autenticación de usuario con la cuenta de la SPA y alertas de error; `/api/leads` ya tiene token por sesión, rate limit básico, límites de lote, timeout hacia n8n y respuestas sin secretos.
7. Ejecutar `npm ci`, `npm run lint`, `npm run build`, build Docker y smoke tests con claves de prueba. Los checks JS/Python y `git diff --check` pasan; TypeScript aún falla por errores preexistentes de la SPA documentados en la entrega.
8. Revisar licencia AGPL-3.0 del kit, políticas de Google Maps y normativa aplicable a contactos públicos/marketing.

## Búsquedas asistidas y referidos

La SPA solo abre URLs en el navegador del usuario y no usa la suscripción de ChatGPT, Perplexity, Claude o Qwen desde el backend. Los referidos son enlaces opcionales configurados con `VITE_REF_*_URL`, visibles y con divulgación; no se registra a nadie ni se inyecta PII de leads.

## Criterio de salida

Publicar únicamente después de validar migración, credenciales, polling del worker, fallback de Maps, carga del VPS, logs/error workflow, prueba de duplicados y una revisión legal documentada.
