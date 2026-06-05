-- Run once in Supabase: SQL Editor → New query → Run
-- Stores only email, name, and timestamp (no birth data).

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon"
  on public.leads
  for insert
  to anon
  with check (true);

-- If you already created the table with birth_date / birth_place, optional cleanup:
-- alter table public.leads drop column if exists birth_date;
-- alter table public.leads drop column if exists birth_place;
