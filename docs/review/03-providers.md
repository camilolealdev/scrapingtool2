# Tarea 3 – Salud de proveedores (solo documentación)

Fecha: 2026-10-12. Sin prueba de humo: no se usaron claves. Las fuentes son búsquedas web; varias son blogs de terceros. Confirmar en la documentación oficial antes de migrar.

| Proveedor | Estado | Evidencia | Acción |
|---|---|---|---|
| Bing (`api/bing.js`, `bingSearch.ts`) | **MUERTO** | Microsoft retiró la Bing Search API el 11 de agosto de 2025 ([aviso oficial](https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement)). Sin altas nuevas | Eliminar proxy, cliente y opción de UI |
| Gemini `gemini-2.0-flash` (`useScraper.ts:145,213`) | **MUERTO** | Cierre de los modelos 2.0 Flash el 1 de junio de 2026 según la [página de deprecaciones](https://ai.google.dev/gemini-api/docs/deprecations?hl=en) y agregadores. El modelo de reemplazo varía por fuente | Cambiar a un modelo vigente de la lista oficial. Mientras tanto, un 404 no activa el fallback a Claude (solo se detecta 429/cuota) |
| Google CSE (`googleCS.ts`) | **DEGRADADO, muere el 1-ene-2027** | Cerrada a clientes nuevos; deja de servir resultados el 1 de enero de 2027 ([resumen](https://brave.com/learn/google-api-shutdown/), fuente de tercero). Los motores nuevos solo buscan en hasta 50 sitios | No invertir. Sustituir por SearXNG |
| Firecrawl `/v1` (`api/firecrawl.js:12`) | **DEGRADADO / legacy** | v2 es la versión por defecto; v1 es legado. No encontré fecha oficial de retiro | Pasar a `/v2` (el esquema de respuesta cambia). Verificarlo en la guía oficial |
| Claude `claude-sonnet-4-6` (`anthropicClaude.ts:15`) | **SIN VERIFICAR** | No consulté la lista de modelos | Confirmar el ID en la documentación |
| Brave (`braveSearch.ts`, `api/brave.js`) | **SIN VERIFICAR** | No consulté planes ni límites vigentes | Confirmar el plan gratuito y el endpoint |
| NVIDIA NIM `nemotron-4-340b-instruct` (`useScraper.ts:201`) | **SIN VERIFICAR** | No comprobé si el modelo sigue publicado | Confirmar en el catálogo de NVIDIA |
| OpenRouter | **SIN VERIFICAR** | El modelo lo elige el usuario (`orModel`) | Sin acción |

## Hallazgos de diseño
1. **ALTA – NVIDIA y OpenRouter no tienen herramienta de búsqueda web.** El prompt dice "USA TU HERRAMIENTA DE BÚSQUEDA WEB", pero esas llamadas son chat simple (`nvidiaNIM.ts`). El modelo puede inventar negocios y teléfonos, justo lo que el prompt prohíbe. Solo Gemini (`googleSearch`) y Claude declaran herramienta de búsqueda. Verificar este último punto en `anthropicClaude.ts`.
2. **ALTA – `callNVIDIANIM` hace `JSON.parse` directo** sobre el texto del modelo (`nvidiaNIM.ts`). Con salida con texto extra o cercas de código, lanza error. No comprueba `resp.ok`.
3. **MEDIA – Fallback Gemini→Claude (`useScraper.ts:183-190`)**: es de un solo salto, sin bucle, y queda registrado en el log, así que no es silencioso ni amplifica reintentos. Falta backoff y no cubre 404/5xx, que es lo que pasa con un modelo retirado.
4. **MEDIA – `googleCustomSearch` no comprueba `resp.ok`**: una cuota agotada devuelve `[]` sin error visible (`googleCS.ts`).

## Estado resumido
Quedan 2 proveedores muertos y 2 degradados; 4 sin verificar. Con la mejora n8n, los reemplazos son SearXNG para la búsqueda web y Firecrawl `/v2` para la extracción.

## Pendiente (necesita al dueño)
Prueba de humo `dentista bogota` por proveedor, con las claves en variables de entorno: `proveedor | HTTP | nº resultados | latencia`.

## Prueba de humo sin claves: `dorking_scraper.py` (2026-10-12)
Entorno aislado (venv fuera del proyecto) con `requests`, `beautifulsoup4` y `duckduckgo-search`. Sin Scrapling. Comando: `dorking_scraper.py "dentista" "bogota" -r co -m 5 -d 2 --no-yandex`. El script genera 34 dorks; el límite de 7 minutos cortó la corrida en la consulta 3.

| Motor | Resultado |
|---|---|
| Google | 0 resultados en las 3 consultas |
| Bing (scraping) | 10 resultados en 1 de 3 consultas; la página resultante no dio lead |
| DDG | 5 resultados en la consulta de Instagram, pero **irrelevantes** (geeksforgeeks, developer.android.com, ibm.com) |
| Brave | 0 resultados |

Hallazgos:
1. **ALTA – Falsos positivos:** el regex de teléfono dio un "lead" con `-15859902` en una página de Android. Hay que exigir coincidencia de ciudad o nicho y validar el formato del teléfono (ver el modo de falla 2 del plan).
2. **ALTA – Rendimiento:** 3 consultas en ~7 minutos, por reintentos con espera entre motores. Las 34 tardarían más de una hora.
3. **MEDIA – Sin Scrapling** el fallback usa BeautifulSoup y Google devuelve vacío. Falta probar con `--stealth` (requiere `scrapling install`, que descarga navegadores).
4. **MEDIA – `duckduckgo_search` está renombrado a `ddgs`** (aviso en cada llamada): actualizar el import.

Conclusión: sin APIs, el script tal como está rinde poco con scraping directo a buscadores. Eso apoya usar **SearXNG** (agrega motores y gestiona sus bloqueos) y verificar cada resultado contra nicho y ciudad antes de aceptarlo como lead. No es evidencia contra Scrapling con navegador, que no se probó.

### Resultado con Scrapling `--stealth` (2026-10-12/13)
Mismo comando y consulta, con `scrapling[fetchers]`, navegadores de Playwright y `ddgs` instalados en un entorno aparte. Corrió los 34 dorks (~35 min) y terminó con **0 leads** ("No leads found"). El log registra 204 respuestas HTTP 429 (Google, `/sorry/`) y 102 respuestas 200 (Bing y otros), pero ninguna página produjo un lead válido.

Conclusión: desde esta IP, Scrapling en modo stealth no resuelve el bloqueo de Google ni mejora la calidad de los resultados de Bing/DDG para `dentista bogota`. Refuerza la decisión de usar SearXNG (con motores que no bloqueen, validación por nicho y ciudad) y no depender de scrapear Google directamente. Limitación: una sola consulta, una sola IP residencial/doméstica; no es una medición de tasa de éxito.
