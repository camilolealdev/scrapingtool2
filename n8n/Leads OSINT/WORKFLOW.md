# Workflow `Leads OSINT`

Este archivo es la definición operativa del workflow aislado de Leads OSINT.
La instancia conectada contiene el workflow, pero permanece inactivo y aislado
de los workflows de producción de Juancho's.

## Flujo `🟠 PENDIENTE | Leads - Maps Fallback`

1. **Webhook** — `POST /leads/run`, valida `x-leads-key` contra `LEADS_N8N_KEY`
   dentro del workflow y responde `202` solo tras autorizar.
2. **Validar entrada** — `niche`, `city`, `country`, `limit`, `strategy` y
   `enrich`; límites 1–100 y textos de máximo 120 caracteres.
3. **Crear run** — generar `run_id`, estado `queued` y adquirir candado en
   `leads_osint_locks`.
4. **Places API** — `POST https://places.googleapis.com/v1/places:searchText`
   usando `X-Goog-Api-Key` como credencial de n8n y un FieldMask mínimo:
   `places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri`.
5. **Decidir fallback automático** — si Places devuelve error, 5xx, cuota o
   cero resultados, n8n deriva al `lead-worker`. El worker intenta en orden
   `GOSOM_URL`, `MAPS_KIT_URL` y finalmente dorking/Scrapling.
6. **Kit opcional** — se usa cuando Gosom no entrega filas. Las URLs son
   internas de Docker y configurables; no se exponen al navegador.
7. **Normalizar** — convertir Places, gosom y kit al contrato `LeadRecord`.
8. **Deduplicar** — `place_id → teléfono → dominio → email → nombre+dirección`.
9. **Upsert Neon** — enviar las filas normalizadas al endpoint server-side
   `/api/leads?mode=ingest`; ejecutar `upsert` por `dedupe_key`, incluyendo
   `run_id`, `source_provider`, `source_url` y `captured_at`.
10. **Cerrar run** — estado `completed`, `partial` o `failed`, contadores y
    duración.
11. **Errores** — los errores del worker cierran la sesión como `failed`; n8n
    conserva datos de error y tiene timeout de ejecución de 15 minutos.

## Contrato server-side

- `POST /api/leads?mode=ingest`: requiere `x-leads-ingest-key`; body
  `{ session_id, rows }`; máximo 100 filas y `dedupe_key` obligatorio.
- `POST /api/leads?mode=close`: requiere el mismo header; body
  `{ session_id, count, status, duration_ms }`; `status` puede ser `completed`,
  `partial`, `failed` o `cancelled`.
- `GET /api/leads?session_id=...`: requiere `x-leads-session-token`; las
  sesiones expiran a las 24 horas y la respuesta usa `Cache-Control: no-store`.

## Body de un job del kit

```json
{
  "name": "lead-enrichment-<run_id>",
  "keywords": ["dentistas en Bogotá"],
  "lang": "es",
  "country": "co",
  "max_time": 600,
  "depth": 3,
  "email": true,
  "socials": true,
  "verify_emails": true,
  "browser_sites": false
}
```

## Reglas de operación

- Un único trabajo Chromium a la vez en el VPS.
- Timeout HTTP de 20 s y máximo de tres reintentos con backoff.
- No guardar ejecuciones exitosas de este workflow en n8n.
- No enviar teléfonos/emails a Jev ni a un modelo generativo.
- Las claves solo viven en credenciales/variables server-side de n8n.
- `GOSOM_IMAGE` y `KIT_REF` deben estar fijados; nunca usar actualización
  automática en producción.
