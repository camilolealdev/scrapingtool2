# Tarea 6 – Legal y riesgo

Fecha: 2026-10-12. **No es asesoría legal.** Las referencias normativas salen de mi conocimiento general y no las verifiqué contra el texto vigente en esta sesión; requieren revisión de un abogado colombiano de protección de datos.

## Qué guarda hoy la herramienta
Tabla `leads` en Supabase (`src/lib/db.ts:insertLeads`): `name, phone, email, whatsapp, website, instagram, address, lat, lng, notes` (con la URL fuente), más la consulta y el proveedor. No guarda consentimiento, fecha de captura, ni forma de excluir a una persona. Las filas no tienen clave única (cada búsqueda repetida duplica datos personales).

## Matriz de riesgo
| Riesgo | Prob. | Impacto | Nivel | Comentario |
|---|---|---|---|---|
| Tratar datos personales sin finalidad ni política (Ley 1581 de 2012) | Alta | Alto | **ALTO** | Teléfonos, correos, WhatsApp e Instagram de independientes y profesionales son datos de personas naturales. Que estén publicados no elimina las obligaciones de finalidad, seguridad y atención de reclamos (por verificar el alcance exacto con abogado) |
| Contacto comercial en frío sin base ni opción de salida | Alta | Medio-Alto | **ALTO** | Hay normas sobre contacto comercial a consumidores (Ley 2300 de 2023, por verificar). Además, tus memorias señalan SPF/DKIM/DMARC sin resolver |
| Incumplir términos de servicio de Google, Instagram, LinkedIn, Maps | Alta | Medio | **MEDIO** | Consecuencia práctica: bloqueo de IP o de cuenta. Ya se observa: Google responde 429 a las pruebas |
| Fuga de la base por una credencial de base de datos comprometida | Media | Alto | **ALTO** | Detalle en el informe de seguridad (no publicado). Una fuga de datos personales agrava el punto 1 |
| Retención indefinida | Alta | Medio | **MEDIO** | No hay política de borrado |
| Datos de menores o datos sensibles capturados por accidente | Baja | Alto | **MEDIO** | `notes` guarda texto libre de páginas |
| Uso de LLM externos con datos de leads | Media | Medio | **MEDIO** | Prompts y resultados pasan por Gemini, Anthropic, OpenRouter y NVIDIA (transferencia a terceros/otros países) |

## Política mínima propuesta (5 líneas)
1. **Finalidad:** prospección comercial B2B de negocios y profesionales, solo para ofrecer los servicios de CCG Digital Studio.
2. **Base legal:** a validar con abogado; mientras tanto, limitarse a datos de contacto de negocios publicados por ellos mismos con fines comerciales.
3. **Retención:** borrar leads sin contacto o respuesta tras 12 meses (plazo propuesto, a ajustar).
4. **Exclusión:** lista de exclusión (`opt_out`) por teléfono, correo y dominio; cada mensaje incluye cómo darse de baja y se atiende un borrado en el plazo legal.
5. **Fuentes permitidas:** buscadores y directorios públicos, sitios propios del negocio y Maps. Sin perfiles personales de redes sociales ni datos de menores.

## Cambios técnicos que se derivan (para el spec de la mejora, no en esta revisión)
- Columnas `captured_at`, `source_url`, `opt_out` y una clave única de deduplicación en `leads`.
- Tarea programada de borrado por retención.
- Filtrar personas naturales (por ejemplo, perfiles personales de Instagram) o marcarlas para revisión.
- Mover llamadas a LLM de modo que no se envíen teléfonos ni correos si no hace falta.
- Si se opera a escala, evaluar el registro de la base de datos ante la autoridad (SIC), por verificar con abogado.

## Pendiente del dueño
- Revisión legal profesional de la política y de la base legal.
- Confirmar si CCG Digital Studio ya tiene política de tratamiento de datos publicada.
