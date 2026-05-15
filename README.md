<div align="center">

# OSINT Lead Finder v5

[![Live Demo](https://img.shields.io/badge/Live%20Demo-scrapingtool2.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://scrapingtool2.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Herramienta profesional de generación de leads B2B mediante Google Dorking e inteligencia OSINT.**

*Professional B2B lead generation tool powered by Google Dorking and OSINT intelligence.*

**[Ver Demo en Vivo →](https://scrapingtool2.vercel.app)**

</div>

---

## Descripción / Overview

OSINT Lead Finder v5 es una aplicación web construida con React + Vite + TypeScript que permite a equipos de ventas y marketing encontrar leads B2B de forma masiva usando técnicas avanzadas de Google Dorking. Diseñada para mercados hispanohablantes, soporta **9 regiones** con plantillas especializadas y extracción de datos con inteligencia artificial.

**9 regiones soportadas:** Colombia (principal), México, Argentina, Chile, Perú, Ecuador, España, EE. UU., Brasil.

---

## Capturas de Pantalla / Screenshots

| Pestaña Constructor | Pestaña Dorks | Pestaña Scraper |
|:-:|:-:|:-:|
| ![Constructor](docs/screenshots/constructor.png) | ![Dorks](docs/screenshots/dorks.png) | ![Scraper](docs/screenshots/scraper.png) |

| Pestaña Mapa | Hero Globe 3D | Modo Claro |
|:-:|:-:|:-:|
| ![Map](docs/screenshots/map.png) | ![Globe](docs/screenshots/globe.png) | ![Light](docs/screenshots/light-mode.png) |

---

## Funcionalidades / Features

### 7 Pestañas de Trabajo

| Pestaña | Descripción |
|---------|-------------|
| **Constructor** | Constructor visual personalizado de dorks — combina operadores, nicho, ciudad y zona libremente |
| **Dorks** | Biblioteca de 150+ plantillas organizadas en 21 categorías OSINT, con búsqueda y filtros |
| **Scraper** | Motor de extracción con IA — obtiene teléfono, email, WhatsApp e Instagram por lead |
| **Mapa** | Mapa interactivo Leaflet con pines geolocalizados para cada lead encontrado |
| **Bulk** | Generación masiva de combinaciones de consultas para campañas de prospección |
| **Favoritos** | Guardado y gestión de dorks favoritos (persistidos en localStorage) |
| **Historial** | Registro completo de todas las consultas ejecutadas en la sesión |

### 21 Categorías de Plantillas OSINT

- Google My Business
- Instagram Leads
- WhatsApp Business
- Facebook Leads
- LinkedIn B2B
- Emails & Datos Directos
- Multi-Red Social
- Webs Obsoletas
- Regional Colombia
- Marketplaces
- Reviews & Reputación
- Shodan / OSINT Técnico
- Yandex Power Operators
- Brave Search Operators
- Power Combos
- Bulk & Automatización
- *(y más categorías especializadas)*

### 6 Proveedores de IA para Scraping

| Proveedor | Modelo | Ventaja |
|-----------|--------|---------|
| **Google Gemini** | Gemini 2.0 Flash | Búsqueda web real integrada — recomendado |
| **Anthropic Claude** | Sonnet 4.6 | Máxima precisión en extracción de datos |
| **OpenRouter** | Multi-modelo | Gateway flexible a modelos variados |
| **NVIDIA NIM** | Cloud GPU | Inferencia acelerada en GPU remota |
| **Google Custom Search** | CSE API | Resultados de búsqueda customizados |
| **Bing / Brave** | Web Search v7 / Brave API | Índice independiente, sin sesgos de Google |

### Mapa Interactivo

- Pines geolocalizados para cada lead extraído
- Botón **MapPin** en cada LeadCard para saltar directamente al mapa
- Capas y controles de zoom estándar Leaflet

### Globe 3D Hero

- Globo 3D renderizado con **COBE v2** en WebGL
- Arcos animados conectando las 9 regiones soportadas
- Renderizado declarativo, sin bucles `requestAnimationFrame` manuales

### Scraper Python Exportable

- Botón en la pestaña Scraper para descargar **`dorking_scraper.py`** (v3.0)
- Construido sobre **Scrapling** con soporte multi-motor
- Deduplicación automática de resultados
- Ejecutable de forma local en cualquier máquina con Python

### Otras Funcionalidades Clave

- **Tema oscuro/claro** — toggle con persistencia en `localStorage`
- **Exportar CSV** — descarga leads y logs en un solo clic
- **Sin backend requerido** — todas las claves API se almacenan en `localStorage`
- **Proxy serverless Vercel** — todas las rutas `/api/*` actúan como proxy para evitar errores CORS
- **Selector de región con banderas** — cambia el contexto geográfico de todas las plantillas
- Soporte completo para **TypeScript 5+** con tipos estrictos

---

## Instalación y Configuración / Installation & Setup

### Prerrequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- (Opcional) Cuenta en uno o más proveedores de IA

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Coorops25/scrapingtool2.git
cd scrapingtool2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves API (todas opcionales)

# 4. Iniciar en modo desarrollo
npm run dev
# La app estará disponible en http://localhost:3000
```

### Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo (puerto 3000)
npm run build    # Build de producción → /dist
npm run preview  # Vista previa del build de producción
npm run lint     # Verificación de tipos TypeScript (tsc --noEmit)
```

---

## Variables de Entorno / Environment Variables

Todas las claves son **opcionales**. Configura solo las que vayas a usar.
También pueden ingresarse directamente desde el panel de **Settings** en la app — se guardan en `localStorage` sin necesidad de reiniciar.

| Variable | Requerida | Fuente | Propósito |
|----------|-----------|--------|-----------|
| `VITE_GEMINI_API_KEY` | Opcional | [Google AI Studio](https://aistudio.google.com) | Scraping con Gemini 2.0 Flash |
| `VITE_ANTHROPIC_API_KEY` | Opcional | [Anthropic Console](https://console.anthropic.com) | Scraping con Claude Sonnet 4.6 |
| `VITE_OPENROUTER_API_KEY` | Opcional | [OpenRouter.ai](https://openrouter.ai) | Gateway multi-modelo |
| `VITE_NVIDIA_API_KEY` | Opcional | [NVIDIA NIM](https://build.nvidia.com) | Inferencia cloud GPU |
| `VITE_GOOGLE_CS_API_KEY` | Opcional | [Google Cloud Console](https://console.cloud.google.com) | Custom Search API |
| `VITE_GOOGLE_CS_CX` | Opcional | [Programmable Search Engine](https://programmablesearchengine.google.com) | ID del motor de búsqueda |
| `VITE_BING_API_KEY` | Opcional | [Azure Portal](https://portal.azure.com) | Bing Web Search v7 |
| `VITE_BRAVE_API_KEY` | Opcional | [Brave Search API](https://brave.com/search/api/) | Índice de búsqueda independiente |

> **Nota:** Las claves ingresadas desde la UI se guardan con el prefijo `osint_` en `localStorage` y tienen prioridad sobre las variables de entorno.

---

## Flujos de Uso / Usage Workflows

### Flujo 1 — Búsqueda Rápida con Dorks

1. Selecciona tu **región** desde el selector de banderas (ej. Colombia)
2. Ingresa el **nicho**, **ciudad** y **zona** en los campos de configuración
3. Ve a la pestaña **Dorks** → elige una categoría → haz clic en una plantilla
4. La consulta se autocompleta → cópiala → búscala directamente en Google

### Flujo 2 — Extracción de Leads con IA

1. Configura tu clave API desde el panel **Settings** (icono de engranaje)
2. Ve a la pestaña **Scraper**
3. Selecciona el proveedor de IA (se recomienda **Gemini** para búsqueda web real)
4. Ejecuta el scraping → los leads aparecen con teléfono, email, WhatsApp e Instagram
5. Haz clic en el ícono **MapPin** de cualquier lead para verlo en la pestaña Mapa
6. Exporta los resultados como **CSV**

### Flujo 3 — Generación Masiva + Script Python

1. Ve a la pestaña **Bulk** → genera todas las combinaciones de consultas
2. Descarga **`dorking_scraper.py`** desde el botón Python en la pestaña Scraper
3. Ejecútalo localmente:

```bash
# Instalar dependencias Python
pip install scrapling

# Ejecutar scraper
python dorking_scraper.py "dentista" "bogota" -r co
```

---

## Stack Tecnológico / Tech Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| [React](https://react.dev) | 19 | Framework de UI |
| [TypeScript](https://www.typescriptlang.org) | 5+ | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Estilos utilitarios |
| [Vite](https://vitejs.dev) | 6.4 | Bundler y servidor de desarrollo |
| [Leaflet](https://leafletjs.com) | 1.9 | Mapas interactivos |
| [react-leaflet](https://react-leaflet.js.org) | 5.0 | Bindings React para Leaflet |
| [COBE](https://github.com/shuding/cobe) | 2.0 | Globo 3D en WebGL |
| [Motion](https://motion.dev) | 12 | Animaciones declarativas |
| [Lucide React](https://lucide.dev) | 0.546 | Iconografía SVG |
| [Vercel Serverless](https://vercel.com/docs/functions) | — | Proxy CORS para APIs externas |

---

## Arquitectura / Architecture

```
scrapingtool2/
├── api/                     # Funciones serverless Vercel (proxy CORS)
│   ├── anthropic.js         #   → Proxy para Anthropic API
│   ├── bing.js              #   → Proxy para Bing Web Search
│   └── brave.js             #   → Proxy para Brave Search API
├── src/
│   ├── components/          # Componentes React
│   │   ├── BuilderTab.tsx   #   Pestaña Constructor
│   │   ├── BulkTab.tsx      #   Pestaña Bulk
│   │   ├── FavoritesTab.tsx #   Pestaña Favoritos
│   │   ├── GlobeHero.tsx    #   Globo 3D COBE
│   │   ├── HistoryTab.tsx   #   Pestaña Historial
│   │   ├── LeadCard.tsx     #   Tarjeta de lead con MapPin
│   │   ├── MapTab.tsx       #   Mapa Leaflet
│   │   ├── ScraperTab.tsx   #   Pestaña Scraper + selector IA
│   │   ├── TemplatesTab.tsx #   Pestaña Dorks (150+ plantillas)
│   │   └── ...              #   Header, TabBar, RegionSelector, etc.
│   ├── hooks/               # Custom hooks (estado global, localStorage)
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Lógica de scraping, generación de dorks
│   ├── App.tsx              # Componente raíz + routing de pestañas
│   └── main.tsx             # Entry point
├── dorking_scraper.py       # Script Python exportable (Scrapling v3.0)
├── vercel.json              # Config Vercel (SPA rewrite + serverless)
├── vite.config.ts           # Config Vite
└── package.json
```

---

## Despliegue / Deployment

### Vercel (Recomendado)

El proyecto ya incluye `vercel.json` preconfigurado. Para desplegar:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Desplegar a producción
vercel --prod
```

O simplemente haz **push a la rama `main`** — Vercel detecta los cambios y despliega automáticamente.

**Configuración incluida:**
- Todas las rutas `/api/*` son funciones serverless (proxy CORS para Anthropic, Bing y Brave)
- SPA rewrite: todas las rutas desconocidas redirigen a `index.html`
- Framework detectado automáticamente como **Vite**

### Variables de Entorno en Vercel

Agrega tus claves en el dashboard de Vercel: **Project Settings → Environment Variables**.
Alternativamente, usa la CLI:

```bash
vercel env add VITE_GEMINI_API_KEY production
```

---

## Contribuir / Contributing

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama con tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m "feat: descripción del cambio"`
4. Abre un Pull Request hacia `main`

---

## Licencia / License

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

Hecho con dedicación para equipos de ventas B2B en América Latina.

**[scrapingtool2.vercel.app](https://scrapingtool2.vercel.app)**

</div>
