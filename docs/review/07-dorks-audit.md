# Auditoría de dorks y comandos (2026-10-13)

"Core inicial" = las 34 consultas de `build_dorks()` en `dorking_scraper.py` (el punto de partida del proyecto) y su versión ampliada en `src/utils/dorkBuilder.ts` (104 plantillas fijas en 16 categorías, más las dinámicas por país).

**Alcance y límites.** Revisé la sintaxis y generé las consultas por país. Para saber si un operador existe usé documentación oficial y fuentes de terceros; varias son blogs. La única medición real de resultados es la corrida de `dentista bogota` (0 leads, ver `03-providers.md`). No ejecuté las 104 plantillas contra los buscadores. Marco cada hallazgo como **verificado** (lo comprobé en el código) o **por confirmar** (viene de documentación externa).

## Conclusión
El núcleo (portales con `site:`, `filetype:` con `@`, `wa.me`, `intitle/inurl contacto`, `after:`) es sintácticamente válido y es lo que sirve. Pero hay un error de generación que rompe dos dorks en 8 de 9 países, un mezclador de operadores por motor que manda sintaxis de Yandex, Bing y Shodan a Google, y unas 20 plantillas que no pueden devolver leads reales con ningún motor.

## Errores verificados en el código
| # | Sev. | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|---|
| 1 | ALTA | `site:cylex.com{tld}` e `infoisinfo.com{tld}` generan `cylex.com.com.co` e `infoisinfo.com.com.mx` (dominios que no existen). Solo España sale bien por casualidad | `dorking_scraper.py:254-255`; salida para co, mx, es | Usar la lista `dirs` por país que ya existe en `dorkBuilder.ts` (`cylex.com.co`, etc.) |
| 2 | ALTA | Las 34 consultas se envían a todos los motores en cascada (Google primero). Las dos "específicas" de Bing y Yandex llevan `loc:`, `inbody:`, `domain:`, `body:` y `\|\|`, que Google trata como texto literal | `dorking_scraper.py:267-269`, función `multi_engine_search` | Asignar cada consulta a su motor, o quitar los operadores propios |
| 3 | MEDIA | `site:mercadolibre.com` fijo en todos los países; el correcto es `mercadolibre.com.co`, `.com.mx`, etc. (el TS sí usa `R.ml`) | `dorking_scraper.py:265` | Tomarlo de la región |
| 4 | MEDIA | Sitios fijos a Colombia sin importar el país: `co.computrabajo.com`, `trovit.com.co`, `locanto.com.co`, `olx.com` | `dorkBuilder.ts` líneas 676-681 | Parametrizar por región o mostrar solo si `region === "co"` |
| 5 | MEDIA | `getBulkDorks` devuelve lista vacía si falta la zona, aunque el nicho y la ciudad estén llenos | `dorkBuilder.ts:802` | Usar la zona solo en las plantillas que la contienen |
| 6 | MEDIA | `buildSearchUrl` pide `num=100` a Google | `dorkBuilder.ts:822,824` | Ver "Operadores y parámetros" abajo |
| 7 | BAJA | Plantilla "Flash" busca "This site requires Flash": en 2026 casi no existe | `dorkBuilder.ts:645` | Quitar |

## Operadores y parámetros (por confirmar con fuentes externas)
| Elemento | Estado | Fuente |
|---|---|---|
| Google `num=100` | **Ya no funciona** desde septiembre de 2025; Google no lo daba por soportado | [Search Engine Land](https://searchengineland.com/google-search-confirms-it-does-not-support-the-results-per-page-parameter-462244) |
| Bing `loc:` | Sigue en la [documentación de Microsoft](https://support.microsoft.com/en-us/bing/advanced-search-keywords) | – |
| Bing `inbody:` | Documentado antes, pero [reportes lo describen como poco fiable](https://github.com/Provereno-Media/Bing-Search-Operators-Cheatsheet) | – |
| Yandex `host:`, `url:`, `mime:`, `date:` | Documentados en la [ayuda oficial](https://yandex.com/support/search/en/query-language/search-operators.md) | – |
| Yandex `body:`, `title:`, `domain:`, `&&`, `/5` | No los encontré en la documentación oficial | – |
| Brave `loc:`, `lang:`, `inbody:`, `filetype:`, `intitle:` | Existen según una [librería de terceros](https://pypi.org/project/bsqb/) que cita la documentación oficial. **`country:` no figura**; la plantilla usa `country:` y debería usar `loc:` | [API de Brave](https://api-dashboard.search.brave.com/documentation/resources/search-operators) |
| Google `after:`, `AROUND(n)`, `filetype:`, `intitle:`, `inurl:`, `intext:` | Válidos, según mi conocimiento; no los probé hoy | – |

## Plantillas que no pueden dar leads reales (por categoría)
| Categoría / plantilla | Problema | Acción |
|---|---|---|
| **Shodan** (6) | Sintaxis `http.title:`, `country:`, `city:` solo existe en shodan.io. Enviada a un buscador web da 0 resultados. Además, "cámaras IP" y "paneles de admin expuestos" son exploración de dispositivos ajenos y no generación de leads | **Quitar la categoría** o moverla a un uso explícito en Shodan. Eliminar sin duda las cámaras y los paneles |
| **Twitter menciones recientes** | `since:`, `lang:` y `-filter:retweets` son sintaxis de la búsqueda interna de X, no de buscadores web | Quitar |
| **Twitter negocios** | `site:twitter.com`: el dominio ahora es `x.com` | Cambiar a `site:x.com` (por confirmar el índice) |
| **LinkedIn "Boolean" y "Sales Nav"** | No son dorks: son cadenas para pegar en LinkedIn | Mantener como texto de copiar, fuera de la ejecución automática |
| **GitHub leads tech** | `extension:md` es sintaxis de la búsqueda de código de GitHub | Quitar o usar `site:github.com ... filetype:md` |
| **DDG bang `!yelp`** | Redirige a Yelp, cobertura útil casi solo en EE. UU. | Quitar para LATAM |
| **Google Maps + portales** (dorks `site:google.com/maps`) | Las páginas de Maps no exponen contacto al rastreo; `extract_from_page` no saca nada | Quitar; usar el scraper de Maps del diseño n8n |
| **Facebook Marketplace y Grupos** | Requieren sesión; Google casi no los indexa | Bajar prioridad |
| **Yandex "Título exacto" y "Proximidad"** | Usan `title:`, `&&` y `/5`, sin respaldo oficial encontrado | Reescribir con `host:`/`mime:`/`date:` |
| **Brave "País + nicho"** | `country:` no es operador de Brave | Cambiar a `loc:` |

## Lo que sí es usable (conservar)
- **Portales por país** (`site:` + directorios de la lista `dirs`): es la mejor fuente y ya está parametrizada por país.
- **Archivos con correo** (`filetype:pdf|xlsx|docx` + `"@"`), **`wa.me`**, **`inurl:contacto`**, **`intitle:contacto`**, **`after:AÑO`** y **`AROUND(5)`**.
- **Páginas de empresa** en LinkedIn (`site:linkedin.com/company/`) como dork, no como scraper.
- **Reseñas / clasificados**: TripAdvisor, Clutch, OLX (con dominio por país).

## Qué hacer
1. Corregir los hallazgos 1 a 5 (código, bajo riesgo) y quitar las plantillas de la tabla de "no pueden dar leads".
2. Etiquetar cada plantilla con su motor y ejecutarla solo ahí.
3. Medir: correr las ~60 plantillas que queden contra SearXNG y registrar `plantilla → nº de resultados → % con teléfono o correo`. Sin esa medición no se puede afirmar que "den resultados reales".

## Cambios aplicados (rama `fix/dorks-latam`, enfoque Colombia y LATAM)
- **Directorios muertos quitados**, tras comprobar cada dominio el 2026-10-13: `opendi.com.co`, `negocios.ccb.org.co`, `tuugo.com.co` (redirige a otro sitio), `opendi.com.mx`, `tuugo`/`opendi` de Perú, seis de Ecuador, `tuugo.com.br`, `indizze.es` y cuatro de Rep. Dominicana. Un 403 se tomó como "vivo con antibots"; un tiempo agotado como "no concluyente" (se conservó).
- **Python:** `build_dorks` usa directorios por país (se acabó `cylex.com.com.co`), MercadoLibre por país, sin operadores de Bing/Yandex y sin los dorks de Google Maps. Colombia sale con 34 consultas, sin ninguna inválida.
- **TypeScript:** quitada la categoría Shodan completa y 13 plantillas sin salida posible; X en vez de Twitter; Brave con `loc:`; sin `inbody:`; Computrabajo con subdominio por país; OLX, Trovit y Locanto solo para Colombia; la zona ya no es obligatoria en Bulk; Google sin `num=100`.
- **No verificado:** que las ~60 plantillas restantes devuelvan resultados. `tsc` da 23 errores antes y después de estos cambios (ninguno en `dorkBuilder.ts`).
- **Corrección a `02-architecture.md`:** el "0 errores" de `tsc` era falso (sin `node_modules` no se comprobaba nada). Medido en un clon con dependencias: 23 errores en 11 archivos.
