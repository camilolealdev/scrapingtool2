# Spec: Google Maps leads con fallback y enriquecimiento

## Objetivo

Permitir búsquedas de leads locales y B2B desde la SPA mediante n8n, usando la
Places API como fuente primaria y gosom como fallback de Maps. El kit de
Mahanaicoach se usa como enriquecedor opcional de sitio web, emails y redes
sociales; no se ejecuta dos veces como descubridor para la misma búsqueda.

## Flujo aprobado

1. La SPA envía `POST /leads/run` a n8n con nicho, ciudad, país, límite y
   estrategia.
2. n8n valida la petición, crea `run_id`, responde `202` y ejecuta el trabajo
   de forma asíncrona.
3. El subflujo Maps intenta Places API.
4. Si Places API falla por credenciales, cuota, error 5xx o devuelve menos del
   mínimo configurable, n8n intenta gosom.
5. Si ambos fallan, el trabajo queda `failed` con el motivo; no se inventan
   leads ni se cae silenciosamente al scraping web.
6. Los resultados pasan por el normalizador `LeadRecord`, deduplicación y
   validación de ciudad/país.
7. Solo los leads que necesitan contacto pasan al kit y, si corresponde,
   Firecrawl/HTTP para enriquecimiento.
8. n8n hace upsert en Supabase y libera el candado.

## Fuentes

- `places_api`: Text Search (New) y Place Details (New), con FieldMask mínimo.
- `gosom`: servicio aislado, una job a la vez, API REST `/api/v1/jobs`.
- `maps_kit`: servicio aislado para la CLI/API del kit; versión fijada y sin
  auto-update.
- `searxng`, `firecrawl_v2` y `lead-worker`: fuentes/enriquecedores existentes.

La licencia AGPL-3.0 del kit requiere una revisión de distribución antes de
convertirlo en un servicio cerrado. gosom es MIT. El scraping directo de Maps
se mantiene desactivable por configuración y requiere revisión legal.

## Contrato LeadRecord

Campos mínimos: identidad, contacto, dirección, coordenadas, `place_id`,
rating, reseñas, categorías, horarios, URL de Maps, señales web, proveedor,
URL de origen, fecha de captura y `dedupe_key`.

La clave se calcula con prioridad `place_id`, teléfono normalizado, dominio,
email y finalmente nombre + dirección. No se guarda un lead sin una fuente
verificable.

## Jobs

- `POST /leads/run` devuelve `{ run_id, status: "queued" }`.
- `GET /leads/run/{run_id}` devuelve estado, contadores, fuente usada y error.
- Estados: `queued`, `running`, `completed`, `partial`, `failed`, `cancelled`.
- Un candado impide dos trabajos Chromium simultáneos en el VPS.
- El worker local conserva un límite de concurrencia 1 y un timeout explícito.

## Datos y privacidad

Supabase es el único escritor. La SPA usa anon solo para lecturas permitidas o
delega todo en n8n. `leads` requiere upsert por `dedupe_key`, `source_url`,
`captured_at`, `opt_out` y trazabilidad de la fuente. Se documentan finalidad,
retención, exclusión y borrado; no se usan perfiles personales ni datos de
menores.

## Fuera de alcance inicial

- Envío automático de campañas.
- Scraping de perfiles privados.
- Firecrawl autoalojado.
- Cambios en workflows de Juancho's.
- Publicación, commit o push.

## Criterios de aceptación

- Una búsqueda de prueba devuelve `202`, un `run_id` y un estado consultable.
- Places API funciona o activa gosom de forma observable.
- Un lead repetido actualiza la misma fila y no crea duplicado.
- El kit solo recibe leads sin contacto suficiente.
- Un fallo de ambos proveedores queda registrado y libera el candado.
- `npm run lint`, pruebas del worker y pruebas de normalización pasan.
