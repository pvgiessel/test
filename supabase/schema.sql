-- ============================================================================
-- Gezinsplanner — Supabase schema
-- ============================================================================
-- Draai dit volledige script in Supabase: Dashboard -> SQL Editor -> New query
-- -> plakken -> Run. Het maakt de tabellen, beveiliging (RLS) en de functies
-- voor het aanmaken/joinen van een gezin aan.
-- ============================================================================

-- 1. Tabellen ----------------------------------------------------------------

-- Een gezin/huishouden. Alle data hangt hieronder.
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Korte code waarmee andere gezinsleden zich kunnen aansluiten.
  invite_code text not null unique default encode(gen_random_bytes(4), 'hex'),
  created_at timestamptz not null default now()
);

-- Profiel van een gezinslid, 1-op-1 gekoppeld aan een ingelogde gebruiker.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  color text not null default '#1f47d8',
  avatar_emoji text,
  avatar_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  description text,
  location_id uuid references public.locations (id) on delete set null,
  -- Lokale ISO-tijd "yyyy-MM-ddTHH:mm" (tijdzone-onafhankelijk bewaard).
  start_at text not null,
  end_at text not null,
  all_day boolean not null default false,
  user_ids uuid[] not null default '{}',
  recurrence jsonb,
  overrides jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title text not null,
  description text,
  date text, -- yyyy-MM-dd of null
  user_ids uuid[] not null default '{}',
  completed boolean not null default false,
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Helper: het huishouden van de huidige gebruiker --------------------------
-- SECURITY DEFINER zodat dit de RLS niet zelf hoeft te doorlopen (geen recursie).
create or replace function public.my_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid()
$$;

-- 3. Row Level Security -------------------------------------------------------
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.appointments enable row level security;
alter table public.tasks enable row level security;

-- Households: leden zien hun eigen huishouden.
drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (id = public.my_household_id());

-- Profiles: zie de leden van je huishouden; beheer alleen je eigen profiel.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (household_id = public.my_household_id());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_delete_self on public.profiles;
create policy profiles_delete_self on public.profiles
  for delete using (id = auth.uid());

-- Locations / appointments / tasks: volledige toegang binnen je eigen huishouden.
drop policy if exists locations_all on public.locations;
create policy locations_all on public.locations
  for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

drop policy if exists appointments_all on public.appointments;
create policy appointments_all on public.appointments
  for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks
  for all using (household_id = public.my_household_id())
  with check (household_id = public.my_household_id());

-- 4. Gezin aanmaken / lid worden ---------------------------------------------
create or replace function public.create_household(
  family_name text,
  profile_name text,
  profile_color text,
  profile_emoji text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.households;
  p public.profiles;
begin
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Je hebt al een profiel in een gezin';
  end if;
  insert into public.households (name) values (family_name) returning * into h;
  insert into public.profiles (id, household_id, name, color, avatar_emoji)
    values (auth.uid(), h.id, profile_name, coalesce(nullif(profile_color, ''), '#1f47d8'), nullif(profile_emoji, ''))
    returning * into p;
  return json_build_object('household', row_to_json(h), 'profile', row_to_json(p));
end;
$$;

create or replace function public.join_household(
  code text,
  profile_name text,
  profile_color text,
  profile_emoji text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.households;
  p public.profiles;
begin
  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Je hebt al een profiel in een gezin';
  end if;
  select * into h from public.households where invite_code = lower(trim(code));
  if h.id is null then
    raise exception 'Ongeldige uitnodigingscode';
  end if;
  insert into public.profiles (id, household_id, name, color, avatar_emoji)
    values (auth.uid(), h.id, profile_name, coalesce(nullif(profile_color, ''), '#1f47d8'), nullif(profile_emoji, ''))
    returning * into p;
  return json_build_object('household', row_to_json(h), 'profile', row_to_json(p));
end;
$$;

grant execute on function public.my_household_id() to authenticated;
grant execute on function public.create_household(text, text, text, text) to authenticated;
grant execute on function public.join_household(text, text, text, text) to authenticated;

-- 5. Realtime: live updates tussen apparaten ---------------------------------
-- (negeer een melding dat een tabel al lid is van de publicatie)
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.locations;
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.tasks;
