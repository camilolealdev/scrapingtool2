# Tarea 5 – Robustez de la extracción

Fecha: 2026-10-12. Mediciones propias en Node y Python 3.13; scripts en el directorio temporal, no en el proyecto.

## Conclusión
`EMAIL_RE` es **cuadrática**: un texto hostil de pocas decenas de miles de caracteres congela el proceso. El criterio del plan (menos de 200 ms sobre 1 MB) **no se cumple**. `PHONE_RE` es segura en ambos lenguajes.

## Tiempos medidos (EMAIL_RE, texto sin `@` válido)
| Entrada | Node 20 000 car. | Node 40 000 car. | Python 40 000 car. |
|---|---|---|---|
| `aaaa…` | 299 ms | 3 771 ms | 2 762 ms |
| `a.a.a.…` | 350 ms | 1 556 ms | 6 212 ms |
| `111…` | 393 ms | 4 507 ms | 6 782 ms |
| `1-1-1-…` | 609 ms | 1 649 ms | – |
| Texto normal con correos | 0 ms | 0 ms | – |

Al duplicar el tamaño el tiempo se multiplica por 4 a 12. Extrapolando, 1 MB tardaría de minutos a horas; no lo medí porque no termina en un tiempo razonable.

`PHONE_RE`: 0 a 35 ms en todos los casos, incluido 1 MB de dígitos.

## Hallazgos
| # | Sev. | Hallazgo | Dónde | Arreglo |
|---|---|---|---|---|
| 1 | ALTA | `EMAIL_RE` cuadrática: `[a-zA-Z0-9._%+-]+@…` reintenta desde cada posición cuando no hay `@` | `firecrawlClient.ts:3`, `bingSearch.ts:3`, `dorking_scraper.py:121` | Buscar primero las posiciones de `@` y extraer alrededor de cada una; o limitar el texto a ~200 KB antes de aplicar la regex |
| 2 | ALTA | Sin tope de tamaño del texto de página: `page.get_text()` pasa directo a las regex | `dorking_scraper.py:~707` | `body_text = body_text[:200_000]` |
| 3 | MEDIA | En el navegador, la regex corre en el hilo principal: una página hostil congela la pestaña | `firecrawlClient.ts` (texto `markdown` completo) | Mismo tope; si hace falta, Web Worker |
| 4 | MEDIA | Dos regex distintas para el teléfono: la de TS acepta cualquier cosa de 7+ dígitos; la de Python captura hasta 20 caracteres con espacios y paréntesis, lo que generó "teléfonos" falsos como `-15859902` | `firecrawlClient.ts:4` vs `dorking_scraper.py:122` | Una función única de normalización y validación (E.164 para Colombia) |
| 5 | BAJA | Los eventos de error del scraper se guardan como `notes = "Error: …"` en el lead (línea 851) | `dorking_scraper.py:851` | Registrar aparte, no mezclarlo con los datos |

## Modos de falla 4 y 5 del plan
- **Regex sobre páginas hostiles (5):** confirmado, ver hallazgos 1 a 3.
- **Dorks largos y resultados vacíos (4):** el script imprime "0 results — trying next engine" y al final "No leads found". Eso es claro en consola. **No revisé el mensaje en la interfaz web**; queda para la Tarea 7. Tampoco medí el comportamiento con dorks de más de 300 caracteres.

## Verificación
Cada falla del enfoque de revisión 4 y 5 tiene resultado, excepto el mensaje en la UI para dorks largos (pendiente en T7).

## Arreglo verificado (2026-10-12, segunda comprobación)
Anteponer `(?<![A-Za-z0-9._%+-])` a `EMAIL_RE` lo vuelve lineal: 1 000 000 de caracteres hostiles en 9 a 18 ms (Node) y los correos normales se siguen detectando (`info@x.com`, `ventas.co@mi-sitio.com.co`). Aplica igual a `dorking_scraper.py:121`; en Python no lo medí.
