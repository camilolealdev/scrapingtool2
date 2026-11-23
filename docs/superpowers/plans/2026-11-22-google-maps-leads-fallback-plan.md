# Plan: integración Google Maps con fallback

## Fase 0 — Seguridad y dependencias

- Confirmar variables de Places, n8n y Supabase sin imprimir valores.
- Fijar versiones/commits de gosom y del kit.
- Revisar AGPL-3.0 del kit y mantenerlo aislado.
- Medir VPS y no tocar workflows de Juancho's.

## Fase 1 — Datos

- Añadir `LeadRecord`, normalización y `dedupe_key`.
- Ampliar migración con campos de Maps, trazabilidad y privacidad.
- Cambiar `insertLeads` a upsert y comprobar errores.

## Fase 2 — Jobs y fuentes

- Hacer asíncrono el worker interno.
- Añadir adaptador de Places API.
- Añadir adaptador gosom con fallback observable.
- Añadir adaptador del kit para enriquecimiento.

## Fase 3 — Stack aislado

- Añadir servicios versionados al compose de Leads OSINT.
- Red interna, sin puertos públicos, límites de CPU/RAM, healthchecks.
- Desactivar actualizaciones automáticas y telemetría donde corresponda.

## Fase 4 — n8n y SPA

- Crear workflow nuevo `Leads OSINT` con webhook, candado, polling,
  fallback, normalización, enriquecimiento, upsert y manejo de errores.
- Añadir selector de estrategia y estado del job en la SPA.
- Mantener la búsqueda manual de Maps como fallback de UX.

## Fase 5 — Limpieza y verificación

- Retirar Bing y el modelo Gemini retirado solo después de confirmar reemplazo.
- Pruebas unitarias, smoke test controlado y prueba de duplicados.
- Actualizar README, `.env.example`, `LEER-PRIMERO.md` y ledger.
- No publicar ni hacer commit sin indicación explícita.
