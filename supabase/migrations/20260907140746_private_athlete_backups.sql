create table public.athlete_backups (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 kind text not null default 'manual' check (kind in ('manual','before-restore')),
 payload jsonb not null check (
  jsonb_typeof(payload) = 'object'
  and payload->>'app' = 'Adaptive Land Prep'
  and payload->>'formatVersion' = '3'
  and jsonb_typeof(payload->'data') = 'object'
  and octet_length(payload::text) <= 10485760
 )
);
create index athlete_backups_user_created_idx on public.athlete_backups(user_id, created_at desc, id desc);
alter table public.athlete_backups enable row level security;
alter table public.athlete_backups force row level security;
revoke all on public.athlete_backups from public, anon, authenticated;
grant select, insert on public.athlete_backups to authenticated;
create policy "Read own backups" on public.athlete_backups for select to authenticated
 using ((select auth.uid()) = user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false');
create policy "Create own backups" on public.athlete_backups for insert to authenticated
 with check ((select auth.uid()) = user_id and coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false');
comment on table public.athlete_backups is 'Private append-only full-state snapshots. Clients cannot update or delete recovery history.';
