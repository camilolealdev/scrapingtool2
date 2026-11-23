# Tratamiento de datos de leads

Este documento es una política técnica operativa, no asesoría legal. Debe ser
revisado para Colombia y para cada país donde se use la herramienta.

## Finalidad

Identificar negocios y contactos profesionales publicados por el propio
negocio para prospección B2B, verificar la fuente y evitar contactos repetidos.
No se buscan perfiles personales, menores ni información no publicada para
contacto comercial.

## Fuentes permitidas

- Places API de Google, respetando sus términos, campos y retención.
- Fuentes web públicas del negocio.
- Directorios públicos y sitios corporativos.
- gosom/kit solo cuando el uso y la distribución hayan sido aprobados.

## Datos guardados

Nombre comercial, teléfono empresarial, email publicado por el negocio, web,
redes del negocio, dirección comercial, coordenadas, `place_id`, fuente,
fecha de captura, proveedor y estado de exclusión.

## Controles obligatorios

- Guardar `source_url` y `captured_at` en cada fila.
- Mantener `opt_out` y una lista de exclusión consultada antes de enriquecer o
  exportar.
- Ofrecer un canal de solicitud de borrado/exclusión.
- No enviar datos de leads a Jev ni a modelos generativos para decidir contacto.
- No iniciar campañas automáticas desde este scraper.
- Definir retención y eliminar datos cuando ya no sean necesarios.
- Registrar errores y accesos sin guardar secretos.

## Prospección

Antes de cualquier contacto se debe validar finalidad, base jurídica, reglas
de marketing directo, identificación del remitente y mecanismo de oposición.
La existencia de un teléfono o email público no equivale automáticamente a
consentimiento para cualquier campaña.
