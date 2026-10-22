-- Aditiva e idempotente: no borra ni cambia datos existentes.
create table if not exists public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists dedupe_key text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists whatsapp text,
  add column if not exists instagram text,
  add column if not exists address text,
  add column if not exists notes text,
  add column if not exists builder text,
  add column if not exists niche text,
  add column if not exists country text,
  add column if not exists city text,
  add column if not exists source text,
  add column if not exists session_id text;

-- Necesario para PostgREST ?on_conflict=dedupe_key (índice único NO parcial; varios NULL permitidos).
create unique index if not exists leads_dedupe_key_uq on public.leads (dedupe_key);
create index if not exists leads_niche_country_idx on public.leads (niche, country);
-- RLS: no se toca aquí a propósito (puede romper la SPA si usa la clave anon). Revisar aparte.
