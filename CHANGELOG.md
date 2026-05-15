# Changelog

All notable changes to **OSINT Lead Finder v5** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [5.6.0] - 2026-05-15

### Added
- COBE rotating globe hero with 9-region markers and animated arcs for visual region selection

---

## [5.5.0] - 2026-05-14

### Added
- Light mode toggle with `localStorage` persistence so the user's theme preference is remembered across sessions

---

## [5.4.0] - 2026-05-13

### Fixed
- Vercel serverless proxy functions for Anthropic, Bing, and Brave APIs to bypass CORS restrictions in production deployments

---

## [5.3.0] - 2026-05-12

### Added
- Bing Search API and Brave Search API integrations as additional search engine sources
- Real AI prompts for lead enrichment and classification
- Live connection between the scraper results panel and the Leaflet map (pins geocoded leads automatically)

---

## [5.2.1] - 2026-05-11

### Fixed
- Added Vite dev-server proxy rewrite for `/api/anthropic` to bypass browser CORS in local development

---

## [5.2.0] - 2026-05-10

### Added
- Auto-persist `.env.local` API keys to `localStorage` on app mount so all APIs connect without manual input after first setup

### Changed
- Auto-fallback from Gemini to Claude on `429 / quota exhausted` errors, improving reliability during high-usage periods
- Refactored `runGemini` and `runClaude` into isolated helper functions for clarity

### Fixed
- Replaced dynamic `import.meta.env` bracket access with a static lookup object so Vite correctly injects `.env.local` keys at build time

---

## [5.1.0] - 2026-05-09

### Added
- **Claude Sonnet 4.6** AI provider with native web search via the Anthropic API (direct mode)
- Color-coded provider badges in a redesigned provider-selector UI (Gemini, Claude, OpenRouter, NVIDIA NIM)

### Fixed
- Removed invalid `App` re-import inside `ScraperPanel` that caused a runtime error
- Fixed `onGeocode` → `searchLocation` prop mismatch in `ConfigInputs`
- Added missing `useEffect` import in `useGeocoding` hook
- Removed unused props forwarded from parent components
- Replaced scrollable single-row category selector with a flex-wrap grid with glow highlight on active state

---

## [5.0.5] - 2026-05-08

### Fixed
- Replaced undefined `scraperGenPy` / `scraperDownloadPy` references with the correct variable names
- Added missing `aiProvider` / `orModel` destructuring in the scraper hook

---

## [5.0.4] - 2026-05-07

### Added
- SVG favicon and full `<head>` meta tags (Open Graph, Twitter Card, description, author)

---

## [5.0.3] - 2026-05-06

### Added
- **Multi-engine search coverage** — queries fan out across Google Custom Search, Bing, and Brave in a single run
- **Python scraper v3.0** output: updated generated script now uses parallel engines and improved filtering

---

## [5.0.2] - 2026-05-05

### Added
- Download-Python-Script button in the scraper panel for one-click export of the generated script
- Scrapling v2.0 integration: script generation now targets the Scrapling async API

### Removed
- Unused `buildTemplates.ts` file (logic merged into `dorkBuilder.ts`)

---

## [5.0.1] - 2026-05-04

### Changed
- `generatePythonScript` output updated to Scrapling v2.0 API, with UI configuration values baked in at generation time

### Fixed
- `getKey()` helper used consistently for all `localStorage` API key reads — eliminates key-not-found regressions
- Corrected `leads/leads` variable name collision that silently shadowed results
- Wired `autoStart` flag so the scraper begins automatically when all required fields are present

---

## [5.0.0] - 2026-05-03

### Added
- Full OSINT Lead Finder v5 integration: all panels (Search, Scraper, Map, Templates, History, Favorites) wired together in a unified layout
- **21 OSINT categories** with **150+ dork templates** covering directories, social platforms, job boards, marketplaces, news, government portals, and more
- **9 geographic regions**: Latin America, North America, Europe, Asia-Pacific, Middle East & Africa, Southeast Asia, South Asia, Eastern Europe, Oceania
- Per-region metadata: language, TLD, Bing locale, DuckDuckGo region, Google Maps domain, country-specific app stores, phone prefixes, and local keywords
- **4 AI providers**: Google Gemini, Anthropic Claude, OpenRouter (multi-model), NVIDIA NIM
- **Leaflet.js map** with geocoding (OpenStreetMap Nominatim) — leads are plotted as pins automatically
- **CSV export** of filtered lead results
- **Bulk dork generation** — generate all templates for a niche/city pair in one click
- **Favorites tab** — star any dork query and revisit it later
- **History tab** — full session history of every query run with timestamps
- **Dark mode** by default with full CSS variable theming via Tailwind v4
- **Python script generation** — export any search session as a ready-to-run Python scraper script
- Vite dev-server proxy rewrites for all API routes (`/api/*`) to avoid CORS in development
- Vercel serverless functions at `api/anthropic.js`, `api/bing.js`, `api/brave.js` for production CORS bypass

### Changed
- Project bootstrapped as **Google Dorking Lab v5** (commit `7c87646`) and evolved to full OSINT Lead Finder during this sprint

### Fixed
- Dork templates corrected to produce valid Google search results (removed non-functional operator combinations)
- Missing `fillTemplate` import in `App.tsx`
- Accent character in default city corrected: `medellin` → `medellín`
- Unused `regionData.ts` removed; all region data lives in `dorkBuilder.ts`

### Performance
- Manual `manualChunks` code-splitting added to Vite config to reduce initial bundle size

---

## [0.1.0] - 2026-04-28

### Added
- Initial commit: Vite + React + TypeScript scaffold with Tailwind v4 and basic project structure

---

[Unreleased]: https://github.com/Coorops25/scrapingtool2/compare/HEAD...HEAD
[5.6.0]: https://github.com/Coorops25/scrapingtool2/compare/750644d...0884404
[5.5.0]: https://github.com/Coorops25/scrapingtool2/compare/1e4596f...750644d
[5.4.0]: https://github.com/Coorops25/scrapingtool2/compare/6c32136...1e4596f
[5.3.0]: https://github.com/Coorops25/scrapingtool2/compare/a832fe4...6c32136
[5.2.1]: https://github.com/Coorops25/scrapingtool2/compare/9c110d9...a832fe4
[5.2.0]: https://github.com/Coorops25/scrapingtool2/compare/5d6727b...9c110d9
[5.1.0]: https://github.com/Coorops25/scrapingtool2/compare/877caf2...47d68da
[5.0.5]: https://github.com/Coorops25/scrapingtool2/compare/28aff1a...877caf2
[5.0.4]: https://github.com/Coorops25/scrapingtool2/compare/f8ad96e...28aff1a
[5.0.3]: https://github.com/Coorops25/scrapingtool2/compare/43b5f1e...f8ad96e
[5.0.2]: https://github.com/Coorops25/scrapingtool2/compare/3cb8edf...43b5f1e
[5.0.1]: https://github.com/Coorops25/scrapingtool2/compare/93060b6...97db851
[5.0.0]: https://github.com/Coorops25/scrapingtool2/compare/e65de77...382522d
[0.1.0]: https://github.com/Coorops25/scrapingtool2/releases/tag/e65de77
