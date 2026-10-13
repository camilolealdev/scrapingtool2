# T2 – Arquitectura y mantenibilidad (2026-10-12)

| Medida | Valor |
|---|---|
| `src/hooks/useScraper.ts` | 779 líneas, 12 commits (el archivo que más cambia) |
| `src/components/ScraperTab.tsx` | 427 líneas, 9 commits |
| `src/utils/dorkBuilder.ts` | 855 líneas (~80 KB, es una tabla de datos) |
| `dorking_scraper.py` | 1106 líneas |
| Ramas por proveedor en `useScraper.ts` | 16 (`if aiProvider === …`) |
| Python incrustado en `useScraper.ts` (`getPythonScriptContent`) | ~367 líneas |

| # | Severidad | Hallazgo | Arreglo |
|---|---|---|---|
| 1 | ALTA | Dos fuentes de verdad del scraper Python: `dorking_scraper.py` (v3.0) y una copia de ~367 líneas dentro del hook TS. Divergen en cada cambio | Generar la descarga desde el archivo `.py` real (importarlo como texto) |
| 2 | ALTA | Un hook mezcla UI, selección de proveedor, prompts, geocodificación y persistencia; cada proveedor nuevo añade ramas en 3 sitios (ejecutar, validar clave, fallback) | Registro de proveedores `{ id, requiresKey, run(query) }` y un solo ciclo; es lo que n8n reemplazaría |
| 3 | MEDIA | `catch {}` vacío al geocodificar (`useScraper.ts:135`): si Nominatim falla, el lead pierde coordenadas sin aviso | Registrar el error con `addLog` |
| 4 | MEDIA | 7 `any` en `useScraper.ts`, 5 en `exportUtils.ts` | Tipar con `ScrapeResult` |
| 5 | BAJA | `catch {}` en hooks de `localStorage` es aceptable | — |

No ejecutado: línea base `tsc --noEmit` (sin `node_modules`). Ruling: no instalar dependencias en tu carpeta durante una revisión de solo lectura; se hará en un clon aparte si lo apruebas.
