alter table public.search_sessions
  add column if not exists expires_at timestamptz not null default (now() + interval '24 hours');

create index if not exists search_sessions_expires_idx
  on public.search_sessions(expires_at);
