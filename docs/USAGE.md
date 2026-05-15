# 🔍 OSINT Lead Finder v5 — Guía de Uso Completa

> **App en vivo:** https://scrapingtool2.vercel.app
> **Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4
> **Propósito:** Generación de leads B2B para LATAM y España usando técnicas OSINT y Google Dorking

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Panel de Región e Inputs Globales](#panel-de-región-e-inputs-globales)
3. [Tab 1: Constructor](#tab-1-constructor)
4. [Tab 2: Dorks (Templates)](#tab-2-dorks-templates)
5. [Tab 3: Scraper (IA)](#tab-3-scraper-ia)
6. [Tab 4: Mapa](#tab-4-mapa)
7. [Tab 5: Bulk](#tab-5-bulk)
8. [Tab 6: Favoritos](#tab-6-favoritos)
9. [Tab 7: Historial](#tab-7-historial)
10. [Configuración de API Keys](#configuración-de-api-keys)
11. [Script Python (dorking_scraper.py v3.0)](#script-python-dorking_scraper-v30)
12. [Tips y Mejores Prácticas](#tips-y-mejores-prácticas)
13. [Resolución de Problemas](#resolución-de-problemas)

---

## Configuración Inicial

No se requiere instalación. La app corre directamente en el navegador en https://scrapingtool2.vercel.app.

Para uso local (desarrollo):

```bash
git clone <repo>
npm install
npm run dev   # Puerto 3000
```

**Único requisito:** Al menos una API key para el scraper IA (ver sección [API Keys](#configuración-de-api-keys)). Para las funciones de dorks y constructor, no se necesita ninguna key.

---

## Panel de Región e Inputs Globales

Antes de usar cualquier tab, configura los tres campos principales que aparecen en la parte superior de la app. Son **persistidos automáticamente en localStorage**.

### Selector de Región

Elige el país objetivo. Esto adapta automáticamente:
- El dominio de Google a usar (`google.com.co`, `google.com.mx`, `google.es`, etc.)
- Los directorios locales en los templates (`PáginasAmarillas`, `Cylex`, `Manta`, etc.)
- Los prefijos telefónicos (`+57`, `+52`, `+34`, etc.)
- El idioma de las palabras clave en los dorks (`contacto`, `teléfono`, `horario`, etc.)
- El marketplace local (`MercadoLibre`, `Sección Amarilla`, etc.)

| Código | País | TLD | Google | Prefijo |
|--------|------|-----|--------|---------|
| `co` | 🇨🇴 Colombia | `.com.co` | google.com.co | +57 |
| `mx` | 🇲🇽 México | `.com.mx` | google.com.mx | +52 |
| `ar` | 🇦🇷 Argentina | `.com.ar` | google.com.ar | +54 |
| `cl` | 🇨🇱 Chile | `.cl` | google.cl | +56 |
| `pe` | 🇵🇪 Perú | `.com.pe` | google.com.pe | +51 |
| `ec` | 🇪🇨 Ecuador | `.com.ec` | google.com.ec | +593 |
| `br` | 🇧🇷 Brasil | `.com.br` | google.com.br | +55 |
| `es` | 🇪🇸 España | `.es` | google.es | +34 |
| `us` | 🇺🇸 USA | `.com` | google.com | +1 |

### Inputs Globales

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nicho / Palabra Clave** | El tipo de negocio a buscar | `dentista`, `restaurante`, `abogado` |
| **Ciudad / Referencia** | Ciudad o zona comercial | `bogota`, `CC Andino`, `Medellin Norte` |
| **Zona** | Barrio o localidad específica | `chapinero`, `polanco`, `gràcia` |

> **Importante:** Los tres campos son obligatorios para usar el Scraper IA y el tab Bulk. Los tabs Constructor y Dorks funcionan sin ellos, pero mostrarán `!!!` en los placeholders si están vacíos cuando intentas buscar.

El icono de navegación (🧭) al lado del campo Ciudad geocodifica la ubicación con Nominatim y centra el mapa automáticamente.

---

## Tab 1: Constructor

**Componente:** `BuilderTab.tsx`

El Constructor permite armar consultas Google Dork desde cero seleccionando operadores OSINT individualmente, combinándolos visualmente y copiando la query final.

### Cómo usarlo

1. **Selecciona operadores** del panel izquierdo (Operadores Google). Cada botón muestra la sintaxis y un ejemplo.
2. **Escribe términos personalizados** en el campo "Personalizado" del panel izquierdo (ej: `"whatsapp" OR "@gmail.com"`).
3. La query resultante aparece en el **panel derecho** con resaltado de sintaxis:
   - 🟠 Naranjo: operadores (`site:`, `intitle:`, `filetype:`, etc.)
   - 🟢 Verde: términos excluidos (`-inurl:`, `-site:`)
   - 🩷 Rosa: frases exactas entre comillas
   - 🔵 Azul/gris: placeholders sin rellenar (`{NICHE}`, `{CITY}`)
4. Usa los botones de acción:
   - **Copiar** (📋): copia la query al portapapeles
   - **Estrella** (⭐): guarda en Favoritos
   - **Google**: abre en Google del país seleccionado
   - **Yandex**: abre en Yandex
   - **Maps**: abre en Google Maps
   - **Scrape**: envía la query al tab Scraper IA

### Operadores disponibles (Google)

| Operador | Sintaxis | Uso OSINT |
|----------|----------|-----------|
| `site:` | `site:instagram.com` | Limita a un dominio específico |
| `intitle:` | `intitle:"contacto"` | Palabra en el título de la página |
| `allintitle:` | `allintitle:dentista medellín` | Todas las palabras en el título |
| `inurl:` | `inurl:admin` | Palabra en la URL |
| `allinurl:` | `allinurl:contact php` | Todas las palabras en la URL |
| `intext:` | `intext:"whatsapp"` | Palabra en el cuerpo de la página |
| `filetype:` | `filetype:pdf` | Tipo de archivo |
| `before:` | `before:2024-01-01` | Publicado antes de la fecha |
| `after:` | `after:2024-01-01` | Publicado después de la fecha |
| `OR` | `dentist OR doctor` | Booleano OR |
| `AND` | `dentist AND clinic` | Booleano AND (implícito) |
| `-` | `-franchise` | Excluir término |
| `""` | `"web design"` | Frase exacta |
| `AROUND(n)` | `"dentist" AROUND(3) "reviews"` | Proximidad de n palabras |
| `related:` | `related:yellowpages.com` | Sitios similares |
| `cache:` | `cache:example.com` | Versión en caché |
| `..` | `precio 100..500` | Rango numérico |

> Los operadores marcados como **deprecated** (tachados) siguen en la interfaz para referencia pero su fiabilidad en Google es baja. Evita `ext:` (usa `filetype:`) e `inanchor:`.

### Ejemplo práctico

Para encontrar dentistas en Bogotá con email visible:

1. Selecciona `intitle:` y `intext:`
2. En "Personalizado" escribe: `"dentista" "bogota" "@gmail.com" OR "@hotmail.com"`
3. La query resultante: `intitle:"contacto" intext:"whatsapp" "dentista" "bogota" "@gmail.com" OR "@hotmail.com"`
4. Clic en **Google** o **Scrape**

---

## Tab 2: Dorks (Templates)

**Componente:** `TemplatesTab.tsx`

La biblioteca de templates es el corazón de la app. Contiene **150+ dorks pre-construidos** organizados en **21 categorías**, todos adaptados automáticamente a tu región, nicho, ciudad y zona.

### Cómo usarlo

1. **Completa primero** los inputs globales (Nicho, Ciudad, Zona).
2. **Selecciona una categoría** usando las pastillas de colores en la parte superior.
3. **Filtra** opcionalmente con la barra de búsqueda o el dropdown de operadores.
4. **Pasa el mouse** sobre cualquier tarjeta para ver los botones de acción.
5. **Clic en "Google"** para abrir directamente en el buscador del país seleccionado.
6. **Clic en "Scrape"** para enviar la query al tab Scraper IA con un clic.
7. La **estrella** (⭐) guarda la query en Favoritos.

### Placeholders que se rellenan automáticamente

| Placeholder | Se reemplaza con |
|-------------|-----------------|
| `{NICHE}` | El nicho que escribiste |
| `{CITY}` | La ciudad que escribiste |
| `{ZONE}` | La zona/barrio que escribiste |
| `{YEAR}` | El año actual (ej: 2026) |

### Las 21 Categorías

| Categoría | Icono | Casos de uso principales |
|-----------|-------|--------------------------|
| **Google My Business** | 🗺️ | Negocios en directorios locales, con contacto expuesto, aperturas recientes, sin web propia |
| **Instagram Leads** | 📸 | Perfiles IG de negocios, emails en bio, links WhatsApp en bio, sin web propia (Linktree) |
| **WhatsApp Business** | 💬 | Links wa.me directos, WA en páginas web, catálogo WA, WA en documentos |
| **Facebook Leads** | 👥 | Páginas FB formales (`/pages/`), Marketplace, páginas con teléfono visible, grupos activos |
| **LinkedIn B2B** | 💼 | Empresas, decisores (CEO, gerente, director), freelancers, empresas contratando |
| **Emails & Datos Directos** | 📧 | PDFs con emails, Excel/CSV con bases de datos, correos corporativos, teléfonos en docs |
| **Multi-Red Social** | 🌐 | TikTok negocios, canales YouTube, Twitter empresas, Reddit proveedores |
| **Webs Obsoletas** | 🔧 | Copyright viejo (2016-2019), sin HTTPS, WordPress sin actualizar, sin diseño móvil |
| **Regional** | 🌎 | MercadoLibre, Páginas Amarillas, directorios locales del país, apps de delivery locales |
| **Marketplaces & Clasificados** | 🛒 | OLX, Computrabajo, Indeed, Trovit, Locanto |
| **Reviews & Reputación** | ⭐ | Trustpilot (reviews negativos = leads), Clutch, G2, TripAdvisor, Capterra |
| **Shodan / OSINT Técnico** | 🔌 | WordPress en tu ciudad, paneles admin expuestos, tiendas online, APIs expuestas |
| **Yandex Power Operators** | 🔴 | Operadores exclusivos de Yandex: `domain:`, `body:`, `title:`, `host:`, proximidad `/n` |
| **Brave Search Operators** | 🦁 | Índice independiente de Brave: `country:`, `lang:`, páginas no indexadas en Google |
| **Power Combos** | ⚡ | Combinaciones multi-operador: Hot Lead (email+WA), freelancers activos, nuevos en 90 días |
| **Bulk & Automatización** | 🤖 | Todas las redes en un dork, todos los directorios, todos los archivos, multi-motor Bing |

### Pro Tips visibles en cada template

Cada tarjeta muestra un **Pro Tip** (💡) que explica cuándo y por qué usar ese dork. Por ejemplo:
- `wa.me/57... = número colombiano directo`
- `Linktree = no tienen web propia = tu cliente`
- `© 2016-2019 = sitio abandonado = oportunidad de redesign`

### Filtros disponibles

- **Búsqueda de texto:** filtra por nombre, descripción o contenido del dork
- **Filtro por operador:** muestra solo dorks que usen `site:`, `inurl:`, `intitle:`, `filetype:`, o que busquen emails/teléfonos

---

## Tab 3: Scraper (IA)

**Componente:** `ScraperTab.tsx`

El Scraper IA es el motor de extracción. Envía tu query a un proveedor de IA que realiza búsqueda web en tiempo real y devuelve leads estructurados directamente en la app.

### Flujo de trabajo

1. Configura la API key del proveedor elegido
2. Pega o escribe una query en el campo de búsqueda (o usa "Scrape" desde otro tab)
3. Elige el modo de extracción
4. Clic en **Extraer** (o presiona Enter)
5. Los leads aparecen en tiempo real en el panel izquierdo
6. Los logs de ejecución aparecen en el panel derecho
7. Exporta a CSV cuando termines

### Modos de Búsqueda

| Modo | Botón | Optimizado para |
|------|-------|----------------|
| **Estándar** | `Extraer` | Búsqueda general de negocios |
| **Instagram** | 📸 rosa | Extracción de perfiles y bios de IG |
| **Emails** | ✉️ verde | Extracción de correos electrónicos |
| **Teléfonos** | ⚡ naranja | Extracción de números y WhatsApp |

### Modo Lote (Batch)

Activa "Lote de URLs" para procesar múltiples queries de una vez:

```
dentista bogota chapinero
restaurante medellin laureles
abogado cali norte
```

Cada línea se procesa secuencialmente con 1.5 segundos de delay entre cada una.

### Proveedores de IA

#### 🔵 Gemini 2.0 Flash (Recomendado)

- **Capacidad clave:** Usa la herramienta `googleSearch` nativa — hace búsqueda web REAL en Google
- **Ventaja:** Índice fresco de Google, sin delay, mejor cobertura de LATAM
- **Costo:** Tier gratuito muy generoso (15 req/min, 1500 req/día)
- **Key prefix:** `AIza...`
- **Obtener key:** https://aistudio.google.com/app/apikey
- **Fallback automático:** Si Gemini llega a cuota, pasa automáticamente a Claude si tienes la key configurada

#### 🟣 Claude Sonnet 4.6

- **Capacidad clave:** Usa la herramienta `web_search_20250305` — búsqueda web vía Anthropic
- **Ventaja:** Excelente estructuración de datos, muy fiable en JSON, ideal para extracciones complejas
- **Costo:** Pay-per-token (sin tier gratuito en producción)
- **Key prefix:** `sk-ant-...`
- **Obtener key:** https://console.anthropic.com/settings/keys

#### 🟤 OpenRouter (Multi-modelo)

- **Capacidad:** Gateway a múltiples modelos (Claude, GPT-4o, Llama 3.1)
- **Ventaja:** Un solo API key para varios modelos, bueno para optimizar costos
- **Modelos disponibles:** Claude 3.5 Sonnet, GPT-4o, Llama 3.1 405B
- **Key prefix:** `sk-or-...`
- **Obtener key:** https://openrouter.ai/keys
- **Nota:** Los modelos de OpenRouter no hacen búsqueda web real — responden con su conocimiento de entrenamiento

#### 🟢 NVIDIA NIM

- **Capacidad:** Inferencia GPU cloud con Nemotron 340B
- **Ventaja:** Modelo muy potente para extracción compleja
- **Key prefix:** `nvapi-...`
- **Obtener key:** https://build.nvidia.com/

#### 🔴 Google Custom Search (CS)

- **Capacidad:** API oficial de búsqueda personalizada de Google
- **Requiere:** API Key + CX ID (Motor de búsqueda personalizado)
- **Flujo:** Busca URLs → Gemini analiza cada página individualmente
- **Obtener:** https://programmablesearchengine.google.com/
- **Nota:** Limitado a 100 búsquedas/día en plan gratuito

#### 🔷 Bing Search API

- **Capacidad:** API oficial de Bing Web Search
- **Ventaja:** Gran índice, buena cobertura de directorios B2B
- **Costo:** Free tier: 1000 transacciones/mes
- **Obtener key:** https://azure.microsoft.com/services/cognitive-services/bing-web-search-api/

#### 🦁 Brave Search API

- **Capacidad:** Índice de búsqueda 100% independiente (no Google, no Bing)
- **Ventaja:** Encuentra páginas que los grandes buscadores no indexan
- **Costo:** Free tier: 2000 req/mes
- **Key prefix:** `BSA...`
- **Obtener key:** https://brave.com/search/api/

### Campos extraídos por lead

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre del negocio |
| `phone` | Teléfono tal como aparece en la web |
| `email` | Correo electrónico |
| `whatsapp` | Link wa.me o número |
| `website` | URL del sitio web |
| `instagram` | Handle `@usuario` |
| `address` | Dirección completa |
| `lat` / `lng` | Coordenadas geográficas (para el mapa) |
| `notes` | URL fuente + descripción breve |

### Geocodificación automática

Si un lead tiene `address` pero no coordenadas, el Scraper llama automáticamente a **Nominatim** (OpenStreetMap) para obtener `lat`/`lng`. Esto permite visualizarlo en el Mapa.

> Nominatim tiene un límite de 1 req/segundo. La app respeta este límite automáticamente con un delay de 550ms entre peticiones.

### Panel de Leads

- **Buscar leads:** filtra por nombre, dirección o email
- **Ordenar:** haz clic en cualquier columna (Nombre, Ciudad, Email)
- **Ver en Mapa:** clic en el icono de 📍 de cada lead card
- **Exportar CSV:** botón "Exportar CSV" (incluye BOM para compatibilidad con Excel)
- **Ver en Mapa (todos):** botón "Ver en Mapa" general

### Panel de Logs

El panel derecho muestra el progreso en tiempo real:
- `🤖 GEMINI - STANDARD - Iniciando: ...` — inicio de la búsqueda
- `📡 Consultando a Gemini...` — llamada a la API
- `📍 Geocodificando N leads...` — geocodificación en curso
- `✅ ¡Éxito! Se añadieron N leads.` — leads agregados
- `❌ Error: ...` — error con detalle

**Exportar logs:**
- **Log** (actual): exporta el log de la sesión actual como `.txt`
- **Todo**: exporta todos los logs combinados de la sesión

---

## Tab 4: Mapa

**Componente:** `MapTab.tsx`

Visualiza los leads geocodificados en un mapa interactivo basado en Leaflet + OpenStreetMap.

### Cómo usarlo

1. Primero extrae leads en el tab Scraper (deben tener coordenadas `lat`/`lng`)
2. Navega al tab **Mapa**
3. Los marcadores aparecen en la ubicación de cada negocio

### Funcionalidades

- **Popup al hacer clic:** muestra nombre, dirección, teléfono y link al sitio web
- **Zoom y pan:** navegación estándar de mapa (scroll = zoom, arrastrar = mover)
- **Centrado automático:** al hacer clic en el ícono 📍 de cualquier LeadCard en el Scraper, el mapa se centra en ese lead con zoom 15
- **Contador de leads posicionados:** barra superior muestra cuántos leads tienen coordenadas

### Notas

- Solo aparecen en el mapa los leads con campos `lat` y `lng` válidos
- Leads sin dirección no se pueden geocodificar automáticamente
- Para mejorar la cobertura, asegúrate de que el AI extraiga el campo `address` completo

---

## Tab 5: Bulk

**Componente:** `BulkTab.tsx`

El tab Bulk genera **todos los dorks de todas las categorías** para tu nicho/ciudad/zona de una sola vez, creando un listado completo listo para sistematizar la prospección.

### Cómo usarlo

1. Completa los tres inputs globales (Nicho, Ciudad, Zona) — **son obligatorios**
2. Navega al tab **Bulk**
3. Verás automáticamente todos los dorks generados (puede ser 100+)
4. Usa los filtros para navegar:
   - **Filtro de categoría:** muestra solo una categoría a la vez
   - **Selector de motor:** elige en qué buscador abrir (Google, Bing, DDG, Yandex, Brave, Mojeek, Maps, LinkedIn, Twitter/X, YouTube, Shodan, GitHub)
5. Para cada dork puedes:
   - 📋 **Copiar** la query individual
   - 🔗 **Abrir** en el motor seleccionado
6. **Copiar Todo**: copia todas las queries visibles al portapapeles (formato `[Categoría] Nombre: query`)

### Motores disponibles en Bulk

| Motor | Mejor para |
|-------|-----------|
| Google | Búsqueda general, la mayoría de los casos |
| Bing | Negocios B2B, filtro `loc:` por país |
| DDG | Privacidad, menos bloqueos anti-scraping |
| Yandex | Operadores únicos, indexa lo que Google ignora |
| Brave | Índice independiente, páginas nuevas |
| Mojeek | Crawler propio, sitios excluidos de Google |
| Maps | Negocios locales en Google Maps |
| LinkedIn | Perfiles profesionales y empresas |
| Twitter/X | Menciones en tiempo real |
| YouTube | Canales de negocio |
| Shodan | Infraestructura web expuesta |
| GitHub | Contactos en repositorios públicos |

### Caso de uso ideal

Tienes un cliente de servicios de diseño web y quieres prospectar todas las clínicas dentales de Bogotá. Con Bulk:
1. Niche: `clinica dental`, Ciudad: `bogota`, Zona: `usaquen`
2. Abre el tab Bulk → 100+ dorks generados
3. Filtra por categoría "Webs Obsoletas" → identifica clínicas con sitios desactualizados
4. Abre cada uno en Google en nuevas pestañas → prospección sistemática

---

## Tab 6: Favoritos

**Componente:** `FavoritesTab.tsx`

Guarda las queries más efectivas para reutilizarlas en el futuro sin tener que reconstruirlas.

### Cómo agregar favoritos

- Desde el **Constructor**: clic en el ícono ⭐ del panel de query resultante
- Desde **Templates**: clic en la estrella en la esquina de cualquier tarjeta

### En el tab Favoritos

Cada query guardada muestra tres acciones al hacer hover:
- 📋 **Copiar** al portapapeles
- 🔍 **Buscar** en Google (abre nueva pestaña)
- 🗑️ **Eliminar** de favoritos

### Persistencia

Los favoritos se guardan en `localStorage` del navegador bajo la clave `osint_favorites`. No se sincronizan entre navegadores ni dispositivos.

---

## Tab 7: Historial

**Componente:** `HistoryTab.tsx`

Registro automático de todas las búsquedas realizadas desde la app. Útil para no repetir prospección ya realizada.

### Qué se registra automáticamente

Cada vez que haces clic en un botón de búsqueda (Google, Bing, DDG, etc.) desde Templates, Builder o Bulk, se agrega una entrada con:
- 🏳️ Bandera del país activo
- La query exacta
- La hora de la búsqueda
- El motor utilizado (google, bing, ddg, yandex, etc.)

### Capacidad

Guarda las últimas **50 búsquedas**. Al superar ese límite, las más antiguas se eliminan automáticamente.

### Reutilizar búsquedas anteriores

Clic en el icono 🔗 de cualquier entrada del historial para volver a abrirla en el mismo motor que usaste originalmente.

---

## Configuración de API Keys

Las API keys se guardan en `localStorage` con el prefijo `osint_`. **Nunca salen del navegador** — no se envían a ningún servidor propio.

### Cómo ingresar las keys

1. Navega al tab **Scraper**
2. Selecciona el proveedor (Gemini, Claude, OpenRouter, etc.)
3. Pega la key en el campo de texto
4. La key se guarda automáticamente al escribir (no hay botón "Guardar")
5. El indicador verde (🟢) confirma que la key está activa

### Tabla de API Keys

| Proveedor | Clave localStorage | Tier Gratuito | Link |
|-----------|-------------------|---------------|------|
| Gemini | `osint_VITE_GEMINI_API_KEY` | ✅ 15 rpm / 1500 rpd | [AI Studio](https://aistudio.google.com/app/apikey) |
| Claude (Anthropic) | `osint_VITE_ANTHROPIC_API_KEY` | ❌ Solo de pago | [Console Anthropic](https://console.anthropic.com/settings/keys) |
| OpenRouter | `osint_VITE_OPENROUTER_API_KEY` | ✅ $1 crédito inicial | [openrouter.ai/keys](https://openrouter.ai/keys) |
| NVIDIA NIM | `osint_VITE_NVIDIA_API_KEY` | ✅ 1000 créditos | [build.nvidia.com](https://build.nvidia.com/) |
| Google CS (key) | `osint_VITE_GOOGLE_CS_API_KEY` | ✅ 100 búsq/día | [Google CSE](https://programmablesearchengine.google.com/) |
| Google CS (CX ID) | `osint_VITE_GOOGLE_CS_CX` | — | Mismo link arriba |
| Bing Search | `osint_VITE_BING_API_KEY` | ✅ 1000/mes | [Azure Portal](https://portal.azure.com/) |
| Brave Search | `osint_VITE_BRAVE_API_KEY` | ✅ 2000/mes | [brave.com/search/api](https://brave.com/search/api/) |

### Combinación Recomendada (presupuesto cero)

Para empezar sin costo:

1. **Gemini** como proveedor principal — tier gratuito muy generoso
2. **Brave Search** como complemento — 2000 requests/mes gratis, índice independiente

Si Gemini llega a su límite de cuota, la app hace **fallback automático a Claude** si tienes la key de Anthropic configurada.

### Variables de entorno (deployment)

Para deployment propio en Vercel, configura las variables de entorno:

```
VITE_GEMINI_API_KEY=AIza...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENROUTER_API_KEY=sk-or-...
VITE_BRAVE_API_KEY=BSA...
```

---

## Script Python (dorking_scraper.py v3.0)

El script Python es para prospección **local y a escala**, sin límites del navegador. Es más potente que la app web para búsquedas masivas.

### Cómo descargar

1. Completa los inputs globales (Nicho, Ciudad, Zona)
2. Navega al tab **Scraper**
3. Clic en **"Descargar .py"** (botón verde) → descarga `dorking_scraper_{nicho}_{ciudad}.py`
4. O clic en **"Copiar Python"** (botón gris) para copiar al portapapeles

El script se genera con tus valores de nicho/ciudad/zona **hardcodeados como defaults**.

### Instalación

**Instalación completa (recomendada):**

```bash
pip install "scrapling[fetchers]" && scrapling install
pip install duckduckgo-search requests beautifulsoup4
```

**Instalación mínima (fallback sin bypass anti-bot):**

```bash
pip install requests beautifulsoup4
```

**Requisitos:**
- Python 3.9+
- Windows / macOS / Linux
- Conexión a internet

### Uso básico (con valores hardcodeados del UI)

```bash
# Usa los valores que estaban en la app cuando descargaste el script
python dorking_scraper.py
```

### Uso con parámetros CLI

```bash
# Colombia: dentistas en Bogotá, barrio Chapinero, max 20 resultados por query
python dorking_scraper.py "dentista" "bogota" -r co -z "chapinero" -m 20

# México: restaurantes en Ciudad de México, 50 resultados
python dorking_scraper.py "restaurante" "ciudad de mexico" -r mx -m 50

# España: abogados en Madrid, 30 resultados
python dorking_scraper.py "abogado" "madrid" -r es -m 30

# Argentina: gimnasios en Buenos Aires con modo stealth (bypass Cloudflare)
python dorking_scraper.py "gimnasio" "buenos aires" -r ar --stealth

# Brasil: salões de beleza en São Paulo con output personalizado
python dorking_scraper.py "salão de beleza" "sao paulo" -r br -o "leads_sp.csv"

# Chile: fontaneros en Santiago con zona específica y delay mayor
python dorking_scraper.py "gasfiter" "santiago" -r cl -z "providencia" -d 5
```

### Parámetros completos

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `niche` | positional | (hardcoded) | Tipo de negocio |
| `city` | positional | (hardcoded) | Ciudad |
| `-r` / `--region` | str | (hardcoded) | Código de región: `co`, `mx`, `ar`, `cl`, `pe`, `ec`, `es`, `us`, `br` |
| `-z` / `--zone` | str | `""` | Barrio o zona específica |
| `-m` / `--max-pages` | int | `10` | Resultados máximos por query |
| `-d` / `--delay` | int | `3` | Segundos entre queries |
| `-o` / `--output` | str | auto | Nombre del archivo CSV de salida |
| `--stealth` | flag | False | Usa StealthyFetcher (bypass Cloudflare) |
| `--spider` | flag | False | Usa Scrapling Spider para rastreo profundo |

### Motor de failover automático

El script intenta los motores en este orden hasta obtener resultados:

```
Google → Bing → DuckDuckGo (librería ddgs) → Yandex → Brave
```

Si Google está bloqueando (CAPTCHA), automáticamente pasa a Bing, luego a DuckDuckGo usando la librería `duckduckgo-search` (sin scraping directo), y así sucesivamente.

### Dorks que genera automáticamente

El script construye estas 12 queries para cada ejecución:

```
site:google.com.co/maps/place/ "dentista" "bogota"
site:google.com.co/maps "dentista" "bogota"
site:instagram.com "dentista" "bogota" -inurl:/p/ -inurl:/reel/
site:instagram.com "dentista" "bogota" "wa.me" OR "whatsapp"
site:instagram.com "dentista" "bogota" "@gmail.com" OR "@hotmail.com"
"dentista" "bogota" intitle:"contacto" intext:"@"
"dentista" "bogota" "wa.me/" OR "api.whatsapp.com/send"
site:facebook.com "dentista" "bogota" -"website"
site:linkedin.com/company/ "dentista" "bogota"
"dentista" "bogota" (site:instagram.com OR site:facebook.com) ("wa.me" OR "@gmail")
"dentista" "bogota" "grand opening" OR "now open" after:2026-01-01
"dentista" "bogota" "chapinero" intext:"phone"
```

### Datos extraídos de cada página

- 📧 **Emails:** regex + links `mailto:` (filtra dominios de ruido: sentry.io, google.com, etc.)
- 📞 **Teléfonos:** regex de patrones internacionales + links `tel:` (solo si ≥7 dígitos)
- 💬 **WhatsApp:** links `wa.me/`, `api.whatsapp.com/send`, `whatsapp://send`
- 📸 **Instagram:** links `instagram.com/@handle` (filtra handles de ruido: explore, stories, etc.)
- 👥 **Facebook:** links `facebook.com/pages/` y perfiles
- 🎵 **TikTok:** links `tiktok.com/@handle`
- 📺 **YouTube:** links de canales

### Deduplicación

Los leads se deduplicaran automáticamente usando un hash combinado de:
- Los últimos 10 dígitos del teléfono normalizado
- El email en minúsculas

Un lead solo es válido si tiene al menos uno de: email, teléfono, WhatsApp o Instagram.

### Salida CSV

El archivo CSV se genera con BOM (Byte Order Mark) para compatibilidad con Excel en español. Columnas:

```
name, phone, email, whatsapp, website, instagram, address, source_url, source_query, notes
```

### Modo Stealth (bypass anti-bot)

```bash
python dorking_scraper.py "dentista" "bogota" -r co --stealth
```

Con `--stealth`, usa `StealthyFetcher` de Scrapling con:
- Chromium headless con fingerprint real
- Espera `network_idle` para páginas dinámicas (React, Vue, etc.)
- Bypass de Cloudflare y Datadome
- Mayor éxito en páginas con protección anti-bot

> **Nota:** El modo stealth es más lento (abre un browser real). Úsalo solo cuando el modo estándar falla.

### Resumen al finalizar

```
================================================================
  ✅ 47 leads → leads_dentista_bogota_co.csv
  📧 Emails: 23
  📞 Phones: 38
  💬 WhatsApp: 19
  📸 Instagram: 15
================================================================
```

---

## Tips y Mejores Prácticas

### Nichos con mejor tasa de conversión OSINT

Los siguientes nichos tienen muchos negocios con datos de contacto expuestos en la web:

| Nicho | Por qué funciona bien |
|-------|----------------------|
| 🦷 Dentistas / Odontología | Muchas clínicas pequeñas con webs propias y emails visibles |
| ⚖️ Abogados / Bufetes | Directorios jurídicos con contacto completo |
| 🍽️ Restaurantes | Alta presencia en IG/FB/WA, muchos sin web propia |
| 💪 Gimnasios / Fitness | Presencia activa en redes, muchos con WA directo |
| 💇 Salones de Belleza | Cuentas IG con WA en bio, alto índice de conversión |
| 🏥 Médicos / Clínicas | Directorios médicos con emails corporativos |
| 🔧 Fontaneros / Gasfiteros | Clasificados y OLX con teléfono directo |
| 🏠 Inmobiliarias | Portales de clasificados con contacto completo |
| 📚 Academias / Colegios | Páginas web con formularios de contacto y emails |
| 🚗 Talleres Mecánicos | Alta presencia en Google Maps con teléfono verificado |

### Estrategia de búsqueda progresiva

```
Nivel 1 (amplio):    "dentista" "bogota"
Nivel 2 (nicho):     "dentista" "bogota" "contacto" -site:instagram.com
Nivel 3 (datos):     "dentista" "bogota" "@gmail" OR "wa.me"
Nivel 4 (documento): "dentista" "bogota" filetype:pdf "@"
Nivel 5 (zona):      "dentista" "bogota" "chapinero" intext:"teléfono"
```

Comienza con Nivel 1 para entender el volumen, luego avanza a niveles más específicos.

### Para leads de WhatsApp

Usa la categoría **WhatsApp Business** en Templates:
- `wa.me/573001234567` = Colombia
- `wa.me/521234567890` = México
- El botón 📱 en el LeadCard abre directamente un chat

### Para listas de email masivas

Usa la categoría **Emails & Datos Directos**:
1. Template "Emails en Excel/CSV": `filetype:xlsx OR filetype:csv "{NICHE}" "{CITY}" "@"`
2. Template "Correos corporativos": busca `ventas@`, `info@`, `contacto@`
3. Combina con Scraper en modo **Emails** (botón ✉️) para extracción automática

### Para prospectar competidores de clientes

Usa **Reviews & Reputación**:
- Busca reviews de 1-2 estrellas del competidor → esos clientes insatisfechos son tus leads
- `site:trustpilot.com "{NICHE}" "1 star" OR "terrible"`
- `site:g2.com "{NICHE}" "bad" OR "doesn't work"`

### Límites y respeto a las APIs

| API/Servicio | Límite | Gestión automática |
|-------------|--------|-------------------|
| Gemini Free | 15 rpm / 1500 rpd | Fallback a Claude si hay cuota |
| Brave Search | 2000 req/mes | Manual |
| Bing Search | 1000/mes (free) | Manual |
| Nominatim geocoding | 1 req/segundo | ✅ Delay de 550ms automático |

### Para búsquedas a gran escala

Para prospectar más de 100 ciudades o nichos, usa el script Python:

```bash
# Bucle para múltiples ciudades (bash/PowerShell)
for ciudad in bogota medellin cali barranquilla; do
    python dorking_scraper.py "dentista" "$ciudad" -r co -m 30
    sleep 60  # Espera 1 minuto entre ciudades
done
```

---

## Resolución de Problemas

### La app no carga / pantalla en blanco

- Verifica que JavaScript esté habilitado en el navegador
- Prueba en Chrome o Firefox (evita Safari para funciones avanzadas)
- Borra caché del navegador: `Ctrl+Shift+R` / `Cmd+Shift+R`

### "⚠ Falta: Nicho, Ciudad y Zona"

Los tres inputs globales son obligatorios para el Scraper IA y el tab Bulk. Los campos en rojo indican cuál falta. Completa los tres antes de continuar.

### El Scraper IA no devuelve resultados

**Checklist en orden:**

1. Verifica que la API key sea válida (el punto de color debe ser 🟢 verde)
2. Prueba primero con **Gemini** — es el más fiable para búsqueda web real
3. Si Gemini da error `429` → cuota diaria agotada, espera hasta mañana o cambia a Claude
4. Si Claude da error `401` → key inválida o sin créditos en Anthropic Console
5. Verifica que la query tenga sentido (no vacía, no solo operadores sin términos)
6. Revisa el panel de **Logs** para ver el error específico

### Error CORS en el Scraper

Los errores CORS están manejados automáticamente por los proxies serverless en `/api/*`. Si ves errores CORS en la consola del navegador:

- Es esperado para Anthropic Claude (la API no permite llamadas desde browsers directamente)
- Verifica el archivo `vercel.json` para las rewrite rules del proxy
- En desarrollo local, usa `npm run dev` — el proxy de Vite maneja CORS

### El Mapa no muestra los leads

Los leads necesitan coordenadas `lat` y `lng` para aparecer en el mapa. Verifica:
1. El lead tiene campo `address` con una dirección válida
2. La geocodificación automática corrió (busca en los logs: `📍 Geocodificando N leads...`)
3. La dirección es suficientemente específica para que Nominatim la encuentre

Si Nominatim no puede geocodificar una dirección, prueba hacer clic en el ícono 🧭 del campo Ciudad para centrar el mapa manualmente.

### El script Python no extrae datos

```bash
# Diagnóstico paso a paso
pip install "scrapling[fetchers]" && scrapling install
pip install duckduckgo-search requests beautifulsoup4

# Verificar instalación
python -c "from scrapling.fetchers import Fetcher; print('Scrapling OK')"
python -c "from duckduckgo_search import DDGS; print('DDGS OK')"

# Si Google bloquea, usar stealth
python dorking_scraper.py "dentista" "bogota" -r co --stealth

# Si todo falla, probar con delay mayor
python dorking_scraper.py "dentista" "bogota" -r co -d 10 -m 5
```

**Causas comunes:**
- Google está devolviendo CAPTCHAs → Usar `--stealth` o cambiar a otra red/IP
- Scrapling no está instalado correctamente → Reinstalar con `pip install "scrapling[fetchers]" && scrapling install`
- `duckduckgo-search` no está instalado → `pip install duckduckgo-search`

### Los favoritos o historial desaparecieron

Ocurre cuando el navegador limpia el `localStorage` (modo privado, limpieza de datos). Los datos de la app están en estas claves:

```
osint_niche          — Nicho guardado
osint_city           — Ciudad guardada
osint_zone           — Zona guardada
osint_region         — Región seleccionada
osint_favorites      — Array JSON de favoritos
osint_VITE_*_API_KEY — API keys guardadas
```

Para exportar tus favoritos antes de limpiar el navegador, cópialos manualmente desde la consola del navegador:
```javascript
JSON.parse(localStorage.getItem('osint_favorites'))
```

---

## Arquitectura Técnica (Referencia)

```
src/
├── App.tsx                    # Root: estado global, routing entre tabs
├── hooks/
│   ├── useScraper.ts          # Motor de scraping, AI providers, geocoding
│   ├── useRegion.ts           # Selector de región, templates dinámicos
│   ├── useFavorites.ts        # CRUD favoritos en localStorage
│   ├── useHistory.ts          # Historial de búsquedas (últimas 50)
│   └── useLocalStorage.ts     # Hook genérico de persistencia
├── utils/
│   ├── dorkBuilder.ts         # REGIONS, OPERATORS, SEARCH_ENGINES, templates, fillTemplate()
│   ├── anthropicClaude.ts     # Cliente Claude claude-sonnet-4-6 con web_search
│   ├── openRouter.ts          # Gateway OpenRouter
│   ├── nvidiaNIM.ts           # NVIDIA NIM client
│   ├── googleCS.ts            # Google Custom Search API
│   ├── bingSearch.ts          # Bing Web Search API
│   ├── braveSearch.ts         # Brave Search API
│   ├── exportUtils.ts         # CSV export con BOM
│   ├── geoUtils.ts            # Nominatim geocoding
│   └── envKeys.ts             # localStorage key manager
├── components/
│   ├── BuilderTab.tsx         # Tab Constructor
│   ├── TemplatesTab.tsx       # Tab Dorks con 21 categorías
│   ├── ScraperTab.tsx         # Tab Scraper IA con logs
│   ├── MapTab.tsx             # Tab Mapa (Leaflet)
│   ├── BulkTab.tsx            # Tab Bulk multi-engine
│   ├── FavoritesTab.tsx       # Tab Favoritos
│   ├── HistoryTab.tsx         # Tab Historial
│   ├── LeadCard.tsx           # Tarjeta de lead individual
│   ├── ConfigInputs.tsx       # Inputs globales (Nicho/Ciudad/Zona)
│   ├── RegionSelector.tsx     # Selector de 9 regiones
│   ├── TabBar.tsx             # Navegación entre tabs
│   └── Header.tsx             # Header con GlobeHero animado
└── types/
    └── index.ts               # Interfaces: ScrapeResult, Template, Region, etc.
```

---

> Desarrollado como herramienta OSINT para prospección B2B responsable en América Latina y España.
> Usa esta herramienta de acuerdo con los términos de servicio de cada plataforma y las leyes de privacidad aplicables (GDPR en España, Habeas Data en Colombia, LFPDPPP en México).
