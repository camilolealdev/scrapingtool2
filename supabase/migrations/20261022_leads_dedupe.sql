-- Esquema de Leads OSINT. YA APLICADO en el proyecto Supabase "scrapingtool2" (mjsyudxqqtvnqzdqmpbo) el 2026-10-22.
-- Idempotente. RLS activado sin politicas para anon: n8n usa service_role; la SPA necesitara login o pasar por n8n.
create table if not exists public.search_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  niche text, city text, zone text, region text,
  ai_provider text, scrape_mode text, query text,
  status text not null default 'running',
  results_count integer default 0,
  duration_ms integer
);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references public.search_sessions(id) on delete set null,
  run_id text,
  source_provider text,
  source_url text,
  captured_at timestamptz not null default now(),
  opt_out boolean not null default false,
  dedupe_key text,
  name text, phone text, email text, whatsapp text, website text,
  instagram text, facebook text, linkedin text, tiktok text, youtube text, x text,
  address text, place_id text, rating double precision, reviews_count integer,
  categories text[], opening_hours text[], google_maps_url text,
  intent_score integer,
  lat double precision, lng double precision,
  notes text, builder text,
  niche text, country text, city text
);
create unique index if not exists leads_dedupe_key_uq on public.leads (dedupe_key);

-- Safe upgrade for projects where the original table already existed.
alter table public.leads add column if not exists source_url text;
alter table public.leads add column if not exists captured_at timestamptz not null default now();
alter table public.leads add column if not exists opt_out boolean not null default false;
alter table public.leads add column if not exists facebook text;
alter table public.leads add column if not exists linkedin text;
alter table public.leads add column if not exists tiktok text;
alter table public.leads add column if not exists youtube text;
alter table public.leads add column if not exists x text;
alter table public.leads add column if not exists place_id text;
alter table public.leads add column if not exists rating double precision;
alter table public.leads add column if not exists reviews_count integer;
alter table public.leads add column if not exists categories text[];
alter table public.leads add column if not exists opening_hours text[];
alter table public.leads add column if not exists google_maps_url text;
alter table public.leads add column if not exists intent_score integer;

create index if not exists leads_session_idx on public.leads (session_id);
create index if not exists leads_niche_country_idx on public.leads (niche, country);
create table if not exists public.scrape_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references public.search_sessions(id) on delete set null,
  message text not null,
  level text not null default 'info'
);
create table if not exists public.error_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text, query text, error_message text, context jsonb
);
alter table public.search_sessions enable row level security;
alter table public.leads enable row level security;
alter table public.scrape_logs enable row level security;
alter table public.error_events enable row level security;
