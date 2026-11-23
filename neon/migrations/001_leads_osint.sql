create extension if not exists pgcrypto;

create table if not exists public.search_sessions (
  id uuid primary key default gen_random_uuid(),
  access_token text,
  created_at timestamptz not null default now(),
  niche text, city text, zone text, region text,
  ai_provider text, scrape_mode text, query text,
  status text not null default 'running',
  results_count integer default 0,
  duration_ms integer,
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table public.search_sessions add column if not exists access_token text;
alter table public.search_sessions add column if not exists expires_at timestamptz not null default (now() + interval '24 hours');
create unique index if not exists search_sessions_access_token_uq on public.search_sessions(access_token);
create index if not exists search_sessions_expires_idx on public.search_sessions(expires_at);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references public.search_sessions(id) on delete set null,
  run_id text, source_provider text, source_url text,
  captured_at timestamptz not null default now(), opt_out boolean not null default false,
  dedupe_key text unique,
  name text, phone text, email text, whatsapp text, website text,
  instagram text, facebook text, linkedin text, tiktok text, youtube text, x text,
  address text, place_id text, rating double precision, reviews_count integer,
  categories text[], opening_hours text[], google_maps_url text,
  intent_score integer, lat double precision, lng double precision,
  notes text, builder text, niche text, country text, city text
);

create index if not exists leads_session_idx on public.leads(session_id);
create index if not exists leads_niche_country_idx on public.leads(niche, country);

create table if not exists public.scrape_logs (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  session_id uuid references public.search_sessions(id) on delete set null,
  message text not null, level text not null default 'info'
);

create table if not exists public.error_events (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  provider text, query text, error_message text, context jsonb
);
