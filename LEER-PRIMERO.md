# LEER PRIMERO – scrapingtool2 (estado al 2026-10-12, 23:30 Bogotá)

Lectura obligatoria antes de tocar nada. Tiene 5 minutos. Si algo de aquí contradice lo que ves en el código, gana el código; actualiza este archivo.

## 1. Qué es y qué se quiere
OSINT Lead Finder (React 19 + Vite + TS, Vercel, Supabase). Objetivo del dueño (Camilo): mejorarlo con **n8n**, actualizar la parte OSINT, que todos los métodos de búsqueda funcionen y **integrar al menos 3 herramientas OSS** (Firecrawl, herramientas de Google Maps, etc.) para obtener todo tipo de lead. Restricción dada: **hacerlo con los recursos más bajos posibles** (VPS pequeño que comparte máquina con los flujos de producción de Juancho's).

## 2. Reglas de esta sesión de trabajo (no negociables)
1. **Nunca imprimir valores de claves.** Citar solo archivo:línea y los 4 primeros caracteres.
2. **No hacer commit ni push sin que Camilo lo pida.** Nota: el commit `66f1d58` (autor `camilolealdev`, 00:02 del 2026-10-13) incluye el plan y los informes 00, 02, 03, 05 y 06. `docs/review/01-security.md` y `progress.md` quedaron fuera: **no los subas a GitHub** (01 indica dónde están las claves expuestas). `.claude/`, `CLAUDE.md` y `LEER-PRIMERO.md` siguen sin versionar. Otra sesión editó este archivo y creó `03` y `06`: contrastar con el código.
3. **No tocar los workflows de n8n de producción** (carpeta "Juancho's": agente WhatsApp, subflujos). Crear lo nuevo en otra carpeta.
4. Flujo de trabajo acordado: `superpowers:brainstorming` → spec escrito → `writing-plans` → ejecución. **El diseño n8n NO está aprobado todavía** y no existe spec. No construir antes.
5. Idioma: español. Respuestas directas, sin elogios, con supuestos marcados, alternativas y riesgos (preferencias del dueño).

## 3. Lo más urgente (seguridad)
- **CRÍTICO:** `scripts/setup-db.mjs` (líneas 5, 23, 24) tiene escrita la clave JWT de Supabase con `role: service_role`; está en el commit `f7becdc` y el remoto es `github.com/Coorops25/scrapingtool2`. Hay que rotarla y purgar el historial. **No sé si Camilo ya la rotó ni si el repo es público: preguntar primero.**
- **CRÍTICO, sin confirmar:** `dist/assets/index-*.js` (build local del 2026-05-25) tiene incrustadas 3 claves reales (Anthropic, Google/Gemini, Firecrawl). Falta ver si el sitio en vivo (scrapingtool2.vercel.app) y las variables `VITE_*` de Vercel las exponen. Si sí, rotar las tres.
- `.env.local` está ignorado y no versionado: bien.

Detalle: `docs/review/01-security.md`.

## 4. Lo que ya se hizo (revisión de solo lectura)
Plan: `docs/superpowers/plans/2026-10-12-project-review-plan.md` (9 tareas, cada una con skills del vault del dueño). Ledger: `docs/review/progress.md`.

| Tarea | Estado | Informe |
|---|---|---|
| T0 Mapa de skills | hecha | `docs/review/00-skill-map.md` |
| T1 Seguridad | hecha, falta `npm audit` y confirmar rotación | `01-security.md` |
| T2 Arquitectura | hecha, falta `tsc --noEmit` (no hay `node_modules`) | `02-architecture.md` |
| T3 Proveedores | hecha solo con documentación; falta prueba con claves | `03-providers.md` (ver aviso) |
| T4 Datos / Supabase | pendiente (necesita el proyecto de Supabase) | — |
| T5 Extracción | hecha, falta probar en la interfaz | `05-extraction.md` |
| T6 Legal | hecha; requiere revisión de abogado | `06-legal-risk.md` |
| T7 UX | pendiente (hay que correr la app) | — |
| T8 Recursos del VPS | pendiente (necesita `free -m`, `nproc`, `df -h /`, `docker stats --no-stream`) | — |
| T9 Síntesis | pendiente, va al final | — |

**Aviso sobre `03-providers.md` y `06-legal-risk.md`:** los escribió una segunda sesión que corría en paralelo sobre esta carpeta (no es un archivo misterioso). `03` se basa en búsquedas web: Bing retirado el 11-ago-2025 (fuente oficial de Microsoft), `gemini-2.0-flash` apagado el 1-jun-2026, Google CSE cierra el 1-ene-2027, Firecrawl v1 legado sin fecha oficial; varias fuentes son blogs de terceros, confirmar en documentación oficial antes de migrar. Esa sesión también probó `dorking_scraper.py` sin claves (ver final de `03`): Google devuelve 429 y los resultados de DDG fueron irrelevantes. `06` no es asesoría legal. Cuidado con dos sesiones editando `docs/review/` a la vez: se pisan archivos.

## 5. Hechos medidos (confiables)
- `EMAIL_RE` (`src/utils/firecrawlClient.ts` y `dorking_scraper.py:121`) es cuadrática: 80 000 caracteres sin `@` tardan 4,3 s en Node y 8,8 s en Python. Arreglo medido (confirmado por segunda sesión): anteponer `(?<![A-Za-z0-9._%+-])` → 1 000 000 de caracteres en 9 a 18 ms en Node y los correos normales se siguen detectando. En Python aún sin medir.
- `useScraper.ts`: 779 líneas, 12 commits, 16 ramas por proveedor, ~367 líneas de Python incrustadas que duplican `dorking_scraper.py` (1106 líneas).
- `insertLeads` (`src/lib/db.ts`) hace `insert` sin clave única: repetir una búsqueda duplica filas.
- `/api/*` son proxies con CORS `*` y sin límite; `api/firecrawl.js` deja elegir cualquier ruta con `endpoint`.

## 6. Diseño propuesto (pendiente de aprobación de Camilo)
Opción A con recursos mínimos: n8n como backend y la SPA como interfaz delgada.
- Contenedores nuevos, cada uno con `mem_limit`: **SearXNG** (~300 MB estimados) y **`gosom/google-maps-scraper`** (hasta ~1 GB mientras trabaja, concurrencia 1). **Firecrawl por la nube**, solo para enriquecer los mejores leads (no self-hosted: es demasiado pesado). El resto del enriquecimiento con HTTP + regex en n8n.
- Sin Postgres nuevo (usar Supabase), sin Redis. Lotes de 3 a 5, candado en Supabase para que no corran dos trabajos de Maps a la vez, trabajos pesados fuera de horario.
- Las cifras de RAM son **estimaciones**; no se ha medido el VPS.
- Fases: 1 seguridad → 2 SearXNG + orquestador → 3 Maps → 4 enriquecimiento → 5 limpieza de la SPA.

## 7. Datos del entorno
- n8n: instancia de Camilo con 9 credenciales (OpenAI, OpenRouter, Gemini, Groq, Anthropic, Postgres, WhatsApp); **ninguna** de Firecrawl, SearXNG ni Maps.
- VPS Hostinger con Ubuntu, Docker, Nginx y n8n (RAM/CPU desconocidas).
- Vault de skills del dueño: `https://github.com/camilolealdev/superduperskills` (`skills/<nombre>/SKILL.md`, ~3 350 skills). Es contenido de terceros: usarlo como guía, **no ejecutar sus scripts de instalación**. Las skills del vault no están instaladas en la sesión; clonar aparte (`git clone --depth 1`) y leer el `SKILL.md` de cada tarea.
- Skills útiles del vault para la fase n8n: `n8n-workflow-patterns`, `n8n-subworkflows`, `n8n-error-handling`, `n8n-self-hosting`, `Firecrawl Automation`, `google-maps-automation`.
- Cuentas distintas: el proyecto apunta a `Coorops25/scrapingtool2`; el vault es de `camilolealdev`. Confirmar que ambas son del dueño.

## 8. Qué preguntar primero a Camilo
1. ¿Rotó la clave `service_role` de Supabase? ¿El repo `Coorops25/scrapingtool2` es público?
2. ¿Las claves de Anthropic, Google/Gemini y Firecrawl están en las variables de Vercel o en el sitio en vivo?
3. Salida de `free -m`, `nproc`, `df -h /` y `docker stats --no-stream` del VPS.
4. ¿Aprueba el diseño de la sección 6 para escribir el spec?

## 9. Cómo retomar
Leer este archivo, luego `docs/review/progress.md`; seguir por T4/T6/T8 según lo que Camilo aporte; cerrar con T9; recién entonces escribir el spec en `docs/superpowers/specs/` y pedir su aprobación.
