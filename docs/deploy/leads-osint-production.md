# Puesta en producción de Leads OSINT

## Vercel — variables server-side

Configurar en Production/Preview según el entorno:

```text
NEON_DATABASE_URL=<connection string pooled del rol leads_app>
LEADS_INGEST_KEY=<secreto aleatorio compartido solo con n8n>
LEADS_N8N_URL=https://easymarketing.tech/webhook/leads/run
LEADS_N8N_KEY=<header auth del webhook>
LEADS_ALLOWED_ORIGIN=https://scrapingtool2.vercel.app
```

`NEON_DATABASE_URL`, `LEADS_INGEST_KEY` y `LEADS_N8N_KEY` nunca deben llevar
prefijo `VITE_` ni aparecer en el bundle, el navegador o el repositorio.

La API envía `x-leads-key: LEADS_N8N_KEY` al webhook; n8n lo valida antes de
crear el job.

## n8n — workflow aislado

Workflow: `🟠 PENDIENTE | Leads - Orquestador` (`iZBpF83ZxFmReaEH`). Debe seguir
inactivo hasta completar el smoke test.

Variables/credenciales requeridas dentro del contenedor de n8n:

```text
LEADS_INGEST_KEY=<igual a Vercel>
GOOGLE_PLACES_API_KEY=<clave restringida por API y dominio/IP>
GOSOM_URL=http://gosom:8080
MAPS_KIT_URL=http://maps-kit:8080
```

El worker recibe `GOSOM_URL` y `MAPS_KIT_URL` y aplica el orden
`gosom → maps-kit → dorking/Scrapling`. El stack se inicia con el perfil `maps`
y una imagen/ref fijados; no usar `latest` en producción.

## Smoke test

Después de desplegar Vercel y configurar n8n:

```powershell
$env:LEADS_API_URL = "https://scrapingtool2.vercel.app/api/leads"
npm run smoke:leads
```

Debe observarse: `202`, polling con token, ejecución n8n, filas en Neon y estado
`completed` o `partial`. Si falla, revisar `search_sessions.status` y los logs de
n8n antes de activar el workflow.

## Seguridad pendiente del operador

- Revocar/regenerar la antigua `service_role` de Supabase y revisar su historial.
- Rotar toda clave que haya estado en `VITE_*`, builds o `localStorage`.
- Usar la connection string del rol `leads_app`, no la del propietario.
- La branch `production` no pudo protegerse porque el plan Neon alcanzó el límite
  de branches protegidas; resolver con upgrade o liberando una protección existente.
