# Síntesis de la revisión con 3 agentes (2026-10-22)

Solo lectura. Tres agentes en paralelo: A (dorks, portales, website builders), B (Scrapling, ScrapeGraphAI, Firecrawl), C (n8n). Etiquetas: **VERIFICADO** = lo comprobé yo en el código o en el paquete; **AGENTE** = lo dice un agente y no lo repetí; **SIN VERIFICAR**.

## 1. Hallazgos que cambian prioridades
| # | Sev. | Hallazgo | Estado |
|---|---|---|---|
| 1 | ALTA | `css_first` no existe en Scrapling 0.5: el paquete oficial solo define `css()` y `xpath()`. `dorking_scraper.py` lo llama 17 veces (líneas 353, 360, 366, 464…). Si esas llamadas están dentro de `try/except` que devuelven vacío, el scraper falla en silencio y explicaría parte del "0 leads" del 12-oct, además del 429 de Google | Método ausente: **VERIFICADO**. Que el `except` lo oculte y que sea la causa del 0: **SIN VERIFICAR** (falta una prueba de una línea con tu versión instalada: `pip show scrapling`) |
| 2 | ALTA | `yalwa.*` redirige (302) a Locanto en co y ec; está en 8 listas de `dorkBuilder.ts` y 7 de `dorking_scraper.py`. Genera dorks que no devuelven nada | Conteo: **VERIFICADO**. Redirección: AGENTE (co y ec, 22-oct) |
| 3 | ALTA | Firecrawl `/v1` en `api/firecrawl.js:12`; en `/v2` la búsqueda devuelve `data.web`, y `firecrawlClient.ts:34` espera un arreglo en `data`. Cambiar solo la URL rompe el cliente | AGENTE |
| 4 | MEDIA | El dork de constructores web (`dorking_scraper.py:266`) solo cubre `wixsite.com`, `weebly.com` y `blogspot.com`; la etiqueta `FreeDomain` (línea 881) solo esos más `wordpress.com` y `jimdo.com` | **VERIFICADO** |
| 5 | MEDIA | El guardado de leads es un `insert` sin clave única (`db.ts`); el nodo Supabase de n8n no tiene upsert | AGENTE (C) |
| 6 | — | Corrección a Agente A: dijo que la lista de `dorking_scraper.py:132-133` bloquea resultados de wixpress/shopify/squarespace. Es `NOISE_EMAIL_DOMAINS`: descarta *correos* con esos dominios (ruido), no sitios. No es un problema | **VERIFICADO** |

## 2. Portales (Agente A, 24 dominios, solo portadas)
VIVO con contenido: infoisinfo.com.co, hotfrog.com.co, paginasamarillas.com.co, seccionamarilla.com.mx, citiservi.com.mx (muestra teléfonos), dir.ar, dir.pe. VIVO pero débil o estancado: blinder.com.co (spam), directorio.com.mx, directorioempresaschile.cl (2024), pymesdechile.cl (2020), directoriodominicano.net, tupalo.com (vacío, está en todas las listas). No encajan: kom.cl, informacolombia.com, baseempresarial.com. Muertos por redirección: yalwa.com.co, yalwa.com.ec. SIN VERIFICAR: cylex.*, guiamexico.com.mx, paginasblancas.com.ar, pyme.pe, eqnegocios.com y los directorios de br, es y us. "VIVO" significa que responde, no que sus fichas internas tengan contacto.

## 3. Detección de website builders (diseño, todo SIN VERIFICAR contra HTML real)
Módulo `builderDetect.ts` + `detect_builder(html, headers)` en Python que devuelva `{builder, confianza, señales}` y una columna `builder` en el lead. Huellas (Agente A, de conocimiento previo; solo Webflow y Shopify tienen blogs de respaldo):
Wix (`meta generator`, `static.parastorage.com`, `static.wixstatic.com`, cabecera `X-Wix-Request-Id`), Squarespace (`static1.squarespace.com`), Shopify (`cdn.shopify.com`, `window.Shopify`), Webflow (`data-wf-page`, `cdn.prod.website-files.com`), WordPress.com (`s0.wp.com`), GoDaddy (`img1.wsimg.com`), Jimdo (`assets.jimstatic.com`), Weebly (`editmysite.com`), Hostinger/Zyro (`zyrosite.com`), Tiendanube (`mitiendanube.com`), Carrd, Google Sites, Linktree y Elementor (generator).
Valor comercial: sitio gratuito o básico = lead de rediseño; Elementor/WP viejo = mantenimiento; Shopify/Tiendanube sin pasarela local = e-commerce.
Prueba con WebSearch: 0 de 10 dorks devolvieron el dominio buscado (ignora `site:`). No prueba nada sobre Google, Bing, Yandex o Brave; la validación real requiere SearXNG o una consulta desde tu IP.

## 4. Las tres herramientas (Agente B; versiones de PyPI el 22-oct)
| | Scrapling | Scrapegraph-ai | Firecrawl |
|---|---|---|---|
| Versión | 0.5 | 2.3.1 | sin releases en GitHub (SDK Python 4.54.0) |
| Licencia | BSD-3 | MIT | **AGPL-3.0** (SDK MIT) |
| Hace | fetch con huella TLS, navegador sigiloso, crawl | extracción semántica con LLM | search, scrape, map, crawl, agent |
| No hace | buscar | anti-bot propio | no confirmado anti-bot en autoalojado |
| Requisitos | Python ≥3.10, navegadores aparte | Python ≥3.12, Playwright, un LLM | Docker con Redis, RabbitMQ, Postgres; RAM sin documentar |
Coincide con la API vigente: `from scrapling.fetchers import Fetcher, StealthyFetcher` y `Fetcher.get(..., stealthy_headers=True, follow_redirects=True)`. Error menor: el mensaje "Scrapling v2 detected" (línea 54).
Contrato: `LeadSource.search({query, region, limit}) → ScrapeResult[]`; un contenedor "lead-worker" (FastAPI, un solo trabajo a la vez, `mem_limit` 1,5 GB) es el único sitio donde corre Python; n8n lo llama por HTTP. ScrapeGraphAI solo bajo demanda, nunca residente. Ninguna cifra de RAM está medida.

## 5. n8n (Agente C; la instancia tiene ~48 workflows, ninguno de leads)
- Nodos oficiales suficientes: Webhook, Execute Workflow, Loop Over Items, Wait, HTTP Request, Postgres (con upsert), Data Table, Error Trigger. Firecrawl y ScrapeGraphAI tienen nodos comunitarios (no instalados): recomienda **no** instalarlos y llamar por HTTP (código de terceros en el proceso compartido con Juancho's). No hay nodo de Maps, Scrapling ni SearXNG utilizable como paso normal.
- Arquitectura: `Webhook POST /leads/run` (Header Auth, responde 202 con `session_id`) → validar entrada → candado en Data Table → crear sesión → Switch por método → lotes de 3 a 5 con Wait → subflujo por fuente (SearXNG, Maps, Firecrawl `/v2`, Scrapling-worker, ScrapeGraphAI) → normalizar a `ScrapeResult` (+57, email válido, dominio) → deduplicar por `dedupe_key = teléfono || email || dominio` → enriquecer solo si falta contacto → `INSERT … ON CONFLICT (dedupe_key)` en Supabase → cerrar sesión y liberar candado. Error Trigger global (modelo: el manejador de la casa) → `error_events` + liberar candado.
- Convenciones de la casa: nombre "🟠 PENDIENTE | Leads - <función>", nodos en español, config en Data Table, 3 reintentos de 2000 ms, timeouts de 20 s. Carpeta nueva "Leads OSINT".
- Ahorro: no guardar ejecuciones exitosas por workflow, timeout de 300 s, recortar texto a 200 KB y devolver solo los campos de `ScrapeResult`. No cambiar la poda global de la instancia: afecta el historial de Juancho's.
- `EMAIL_RE` cuadrática (05-extraction.md) bloquearía el proceso compartido de n8n: aplicar el tope y el arreglo antes de cualquier flujo.
- Webhook público: token largo, comparación en tiempo constante, límite de peticiones; las claves como credenciales de n8n, no en nodos.

## 6. Qué no se pudo verificar
Medidas del VPS (`free -m`, `nproc`, `docker stats`); límite de ejecuciones concurrentes y variables de poda de n8n; esquema real de las tablas de Supabase (índices, RLS); si hay SearXNG o Maps desplegados; precios de Firecrawl y fecha de retiro de `/v1`; las huellas de builders; que algún dork funcione en un buscador real; la red del computador del dueño devolvió 403 a todo `curl`, así que nada se probó desde allí.

## 7. Siguiente paso propuesto (sin aprobar)
1. Prueba mínima de una línea con `css()` en tu versión de Scrapling (confirma el hallazgo 1).
2. Rotar y purgar la clave de Supabase del historial (sigue sin confirmarse).
3. Medir el VPS con los 3 comandos.
4. Con tu aprobación del diseño: escribir el spec en `docs/superpowers/specs/` y después el plan.
