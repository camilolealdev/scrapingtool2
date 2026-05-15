# Contributing to OSINT Lead Finder v5

Thank you for your interest in contributing. This guide covers everything you need to set up a local development environment, understand the project architecture, and submit high-quality changes.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [How to Add a New OSINT Category](#how-to-add-a-new-osint-category)
5. [How to Add a New AI Provider](#how-to-add-a-new-ai-provider)
6. [How to Add a New Region](#how-to-add-a-new-region)
7. [Code Style](#code-style)
8. [Commit Convention](#commit-convention)
9. [Pull Request Process](#pull-request-process)
10. [Environment Variables Reference](#environment-variables-reference)

---

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9
- A Vercel account (optional, for production deploy testing)

### Clone and Install

```bash
git clone https://github.com/Coorops25/scrapingtool2.git
cd scrapingtool2
npm install
```

### Environment Variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored. Vite injects these values at build time via the static lookup object in `src/utils/envKeys.ts`. Keys are also auto-persisted to `localStorage` on first mount so the UI connects without manual input after initial setup.

### Run the Dev Server

```bash
npm run dev   # http://localhost:3000
```

The Vite dev server includes proxy rewrites for `/api/*` routes so all API calls hit your local serverless function stubs rather than requiring a live Vercel deployment.

### Build for Production

```bash
npm run build    # outputs to dist/
npm run preview  # serves dist/ locally to verify the build
```

### Type Check (no emit)

```bash
npm run lint     # runs tsc --noEmit
```

---

## Project Structure

```
scrapingtool2/
├── api/                         # Vercel serverless functions (CORS proxies)
│   ├── anthropic.js             # Proxy for Anthropic Claude API
│   ├── bing.js                  # Proxy for Bing Search API
│   └── brave.js                 # Proxy for Brave Search API
│
├── src/
│   ├── components/              # React UI components (one per tab/feature)
│   ├── hooks/                   # Custom React hooks
│   │   ├── useScraper.ts        # Core scraper orchestration hook
│   │   ├── useRegion.ts         # Region selection + metadata
│   │   └── useGeocoding.ts      # Nominatim geocoding for map pins
│   ├── utils/                   # API integrations + shared utilities
│   │   ├── dorkBuilder.ts       # MASTER: regions, operators, templates, fillTemplate
│   │   ├── anthropicClaude.ts   # Claude API client
│   │   ├── bingSearch.ts        # Bing Search API client
│   │   ├── braveSearch.ts       # Brave Search API client
│   │   ├── googleCS.ts          # Google Custom Search API client
│   │   ├── openRouter.ts        # OpenRouter multi-model client
│   │   ├── nvidiaNIM.ts         # NVIDIA NIM inference client
│   │   ├── envKeys.ts           # Static env key lookup + localStorage helpers
│   │   └── exportUtils.ts       # CSV export logic
│   ├── types/                   # TypeScript interfaces and enums
│   ├── App.tsx                  # Root component, tab routing, global state
│   ├── main.tsx                 # Vite entry point
│   └── index.css                # Tailwind v4 + CSS variable theme definitions
│
├── public/                      # Static assets (favicon.svg, og-image, etc.)
├── vercel.json                  # Vercel routing + function config
├── vite.config.ts               # Vite build config, dev proxy rewrites, manualChunks
├── tailwind.config.ts           # Tailwind v4 theme extension
├── tsconfig.json
└── package.json
```

---

## Architecture Overview

### Data Flow

```
User Input (Niche / City / Region)
        │
        ▼
dorkBuilder.ts → fillTemplate() → dork queries
        │
        ▼
Search Engines (Google CS / Bing / Brave)  ←→  /api/* Vercel proxies
        │
        ▼
AI Provider (Gemini / Claude / OpenRouter / NVIDIA NIM)
        │
        ▼
ScrapeResult[]  →  ResultsPanel  →  Leaflet Map (geocoded)
                               →  CSV Export
                               →  Python Script Generation
```

### API Key Flow

Keys are read in this priority order:
1. `.env.local` (injected by Vite at build time via `envKeys.ts`)
2. `localStorage` (auto-persisted on mount; editable in the Settings panel)

All API calls in development go through Vite proxy rewrites (`/api/*` → localhost functions). In production, the same paths are handled by Vercel serverless functions in `api/`.

---

## How to Add a New OSINT Category

All categories live in `src/utils/dorkBuilder.ts` inside the `buildTemplates()` function. Each entry in the array defines one category card in the Templates tab.

### Step-by-step

1. Open `src/utils/dorkBuilder.ts`.
2. Find the `buildTemplates()` function and append a new object to the returned array.
3. Each category requires the following shape:

```typescript
{
  id: 'new-category',           // kebab-case unique identifier
  name: 'Mi Nueva Categoría',   // Display name shown in the UI
  icon: '🔍',                   // Single emoji icon
  color: '#FF5252',             // Hex accent color for the category card
  templates: [
    {
      name: 'Template name',
      query: 'site:{DOMAIN} "{NICHE}" "{CITY}" contact',
      desc: 'Human-readable description of what this query finds',
      proTip: 'Optional usage tip shown on hover'
    }
  ]
}
```

### Available Template Placeholders

| Placeholder | Replaced with |
|-------------|---------------|
| `{NICHE}`   | The user's niche/industry input |
| `{CITY}`    | The user's target city |
| `{ZONE}`    | Region zone name (e.g. "Latin America") |
| `{YEAR}`    | Current year (e.g. "2026") |
| `{DOMAIN}`  | TLD for the selected region (e.g. `.com.co`) |
| `{LANG}`    | Language code for the region (e.g. `es`) |

### Tips for Good Templates

- Test every query in a real browser first — invalid operator combinations return zero results.
- Use `site:` or `inurl:` to scope results; avoid stacking more than 3 advanced operators per query.
- Provide a `proTip` that explains a non-obvious refinement (e.g. "Add `filetype:pdf` to find formal directories").

---

## How to Add a New AI Provider

Follow these steps in order. Each step is required.

### 1. Create the API client

Create `src/utils/newProvider.ts`:

```typescript
import type { ScrapeResult } from '../types';

export async function newProviderSearch(
  apiKey: string,
  query: string
): Promise<ScrapeResult[]> {
  // Call /api/newprovider (goes through Vercel proxy in production,
  // Vite dev proxy in development)
  const res = await fetch('/api/newprovider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, query }),
  });
  if (!res.ok) throw new Error(`newProvider error: ${res.status}`);
  const data = await res.json();
  // Map provider response shape → ScrapeResult[]
  return data.results.map((r: any) => ({ ... }));
}
```

### 2. Register the API key in `envKeys.ts`

```typescript
// src/utils/envKeys.ts
export const KEY_MAP = {
  // ... existing keys
  newprovider: import.meta.env.VITE_NEWPROVIDER_API_KEY ?? '',
};
```

### 3. Add the provider option to the type

```typescript
// src/types/index.ts  (or wherever aiProvider is declared)
export type AIProvider = 'gemini' | 'claude' | 'openrouter' | 'nvidia' | 'newprovider';
```

### 4. Add the branch in `useScraper.ts`

Inside the `runAIScrape()` function, add:

```typescript
case 'newprovider':
  results = await newProviderSearch(getKey('newprovider'), dork);
  break;
```

### 5. Add the Vercel serverless proxy

Create `api/newprovider.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { apiKey, query } = req.body;
  const upstream = await fetch('https://api.newprovider.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });
  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
```

### 6. Add the Vite dev proxy rewrite

In `vite.config.ts`, add to the `server.proxy` object:

```typescript
'/api/newprovider': {
  target: 'http://localhost:3000',
  changeOrigin: true,
},
```

### 7. Add the provider badge in `ScraperTab.tsx`

Add a color-coded badge entry to the provider selector so the user can choose the new provider from the UI.

---

## How to Add a New Region

All region definitions live in the `REGIONS` array in `src/utils/dorkBuilder.ts`. Each region object must include all of the following fields:

```typescript
{
  name: 'My New Region',    // Display name
  flag: '🏴',               // Flag emoji
  lang: 'en',               // ISO 639-1 language code
  google: 'google.com',     // Google domain for this region
  tld: '.com',              // Country/regional TLD (used in {DOMAIN} placeholder)
  bing_loc: 'en-US',        // Bing market locale string
  ddg_region: 'us-en',      // DuckDuckGo region parameter
  maps: 'maps.google.com',  // Google Maps domain
  ml: ['linkedin.com'],     // Local professional networking sites
  pa: ['yellowpages.com'],  // Local business directories
  dirs: ['yelp.com'],       // General local directories
  apps: ['play.google.com'],// App stores common in this region
  phone: '+1',              // International phone prefix
  kw: ['LLC', 'Inc'],       // Local business-type keywords used in queries
}
```

After adding the region, it will automatically appear in the region selector and all templates will be generated with the region's metadata substituted in the placeholders.

---

## Code Style

### TypeScript

- Strict mode is enabled (`tsconfig.json` — do not loosen it).
- Prefer `interface` over `type` for object shapes; use `type` for unions and aliases.
- Avoid `any` — use `unknown` and narrow explicitly.
- All async functions must handle and surface errors (no silent swallows).

### Styling

- Tailwind v4 with CSS variables — see `src/index.css` for the full token set.
- Use semantic CSS variable classes (`bg-bg0`, `bg-bg1`, `bg-bgc`, `text-t0`, `text-t1`, `text-t2`, `border-b0`, `border-b1`, etc.) instead of arbitrary Tailwind values.
- Do not add `style={{}}` inline overrides unless absolutely unavoidable.

### General

- No comments unless the **why** is non-obvious. The code should read as documentation.
- Prefer editing existing files over creating new ones.
- All external API calls must go through `/api/*` (Vite dev proxy in development, Vercel serverless functions in production). Never call third-party APIs directly from the browser in production.
- Component files: one component per file, named to match the component.
- Hooks live in `src/hooks/`, pure utilities in `src/utils/`.

---

## Commit Convention

Use the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <short imperative description>

[optional body]
```

| Type       | When to use |
|------------|-------------|
| `feat`     | New feature or capability |
| `fix`      | Bug fix |
| `refactor` | Code restructuring with no behavior change |
| `perf`     | Performance improvement |
| `docs`     | Documentation only |
| `chore`    | Build config, dependency updates, tooling |
| `test`     | Adding or updating tests |

**Examples:**

```
feat: add OpenRouter provider with model selector dropdown
fix: use getKey() for localStorage API key reads in useScraper
perf: add manualChunks to vite.config to split vendor bundle
chore: update Scrapling dependency to v2.1
```

- Keep the subject line under 72 characters.
- Use the imperative mood ("add", not "adds" or "added").
- Reference issue numbers in the body when applicable: `Closes #42`.

---

## Pull Request Process

### Before You Open a PR

1. **Fork** the repo and create a **feature branch** off `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Lint** (type-check) your code — zero errors required:
   ```bash
   npm run lint
   ```

3. **Test both themes** — open the app in dark mode and light mode and verify your changes look correct in both.

4. **Test at least one AI provider** end-to-end (Gemini is the easiest with a free-tier key).

5. **Test the Python script download** — run a search, open the Script panel, generate and download the `.py` file, verify it runs without syntax errors.

### Submitting

1. Push your branch and open a PR against `main`.
2. Fill in the PR description: what changed, why, and how to test it.
3. Keep PRs focused — one logical change per PR. Large PRs are harder to review and slower to merge.
4. If your change touches `dorkBuilder.ts` (regions, templates), include a before/after screenshot of the Templates tab.

### Review Criteria

- No TypeScript errors (`npm run lint` passes).
- No regressions in existing categories, regions, or providers.
- Both light and dark modes render correctly.
- API calls route through `/api/*` — no direct third-party calls from the browser.
- Commit history is clean (squash fixup commits before requesting review).

---

## Environment Variables Reference

| Variable | Provider | Required |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Google Gemini | For Gemini provider |
| `VITE_ANTHROPIC_API_KEY` | Anthropic Claude | For Claude provider |
| `VITE_OPENROUTER_API_KEY` | OpenRouter | For OpenRouter provider |
| `VITE_NVIDIA_API_KEY` | NVIDIA NIM | For NVIDIA provider |
| `VITE_GOOGLE_CSE_KEY` | Google Custom Search | For Google search engine |
| `VITE_GOOGLE_CSE_ID` | Google Custom Search | For Google search engine |
| `VITE_BING_API_KEY` | Bing Search | For Bing search engine |
| `VITE_BRAVE_API_KEY` | Brave Search | For Brave search engine |

All variables must be prefixed with `VITE_` for Vite to expose them to client-side code. The static lookup in `src/utils/envKeys.ts` maps these to runtime values.

In Vercel production, set the same variables under **Project Settings → Environment Variables**. The serverless proxy functions in `api/` read from `process.env` at runtime.
