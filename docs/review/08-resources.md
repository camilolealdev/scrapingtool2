# Tarea 8 – Presupuesto de recursos del VPS (parcial)

Fecha: 2026-10-13. Fuente: captura del panel de Hostinger que pegó el dueño. No hay medición por contenedor.

## Datos recibidos
| Dato | Valor |
|---|---|
| Plan | KVM 4 (nombre `easy.server`), Ubuntu 24.04 LTS, estado "funcionando" |
| CPU en uso | 3 % |
| Memoria en uso | 11 % |
| Disco | 8 GB de 200 GB |
| Tráfico | 2,8 MB entrante, 1,3 MB saliente; 0,005 TB de 16 TB de ancho de banda |

## Lo que se infiere (no está en la captura)
- El plan KVM 4 de Hostinger suele ser de **4 vCPU y 16 GB de RAM**. Es una inferencia del nombre del plan y de los 200 GB de disco que sí aparecen; **confirmar con `free -m` y `nproc`**.
- Con 16 GB, el 11 % equivale a unos **1,8 GB usados** y unos 14 GB libres.
- Es una foto de un instante: no muestra picos de n8n ni de los flujos de Juancho's.

## Presupuesto propuesto (cifras de diseño, no medidas)
Regla del plan: la suma de picos no supera el 70 % de la RAM libre. Con ~14 GB libres, el tope es **~9,8 GB**.

| Servicio | RAM en reposo | RAM pico (estimada) | `mem_limit` propuesto |
|---|---|---|---|
| SearXNG | 150–300 MB | ~400 MB | 512 MB |
| Scraper de Maps (Chromium, concurrencia 1) | ~0 (solo bajo demanda) | 0,5–1,5 GB | 1,5 GB |
| Firecrawl autoalojado (opcional, API + navegador + Redis) | 1–2 GB | 4–6 GB | 6 GB |
| n8n y flujos de Juancho's | **medir** | **medir** | no tocar |

Con SearXNG y Maps, el pico añadido es ~2 GB, muy por debajo del tope. Con Firecrawl autoalojado, ~8 GB: cabe, pero deja poco margen si Juancho's tiene picos.

## Conclusión
El VPS **sí aguanta** SearXNG y el scraper de Maps, y probablemente también Firecrawl autoalojado. Por prudencia, empezar con SearXNG y Maps, Firecrawl en la nube, y pasar a autoalojado solo si los créditos pesan, con `mem_limit` y vigilando `docker stats`.

## Falta medir (3 comandos, solo lectura, en el VPS)
```bash
free -m && nproc && df -h / && docker stats --no-stream
```
Con eso se reemplazan las filas "medir" y se cierra esta tarea.
