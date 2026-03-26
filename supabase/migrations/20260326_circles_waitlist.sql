-- ══════════════════════════════════════════════════════════════════════
--  Deep-Dive Circles: Tables + Seed
--  Run this in the Supabase SQL editor (or via supabase db push)
-- ══════════════════════════════════════════════════════════════════════

-- Enable uuid generation (usually already enabled)
create extension if not exists "pgcrypto";

-- ── circles ───────────────────────────────────────────────────────────
create table if not exists circles (
  id                  uuid primary key default gen_random_uuid(),
  title               text,
  scheduled_date      timestamptz,
  max_participants    integer not null default 12,
  min_participants    integer not null default 6,
  status              text    not null default 'forming'
                        check (status in ('forming','scheduled','live','completed')),
  zoom_link           text,
  recording_url       text,
  schedule_poll_url   text,
  created_at          timestamptz not null default now()
);

-- ── circle_waitlist ───────────────────────────────────────────────────
create table if not exists circle_waitlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  circle_id   uuid references circles(id) on delete set null,
  status      text not null default 'waiting'
                check (status in ('waiting','scheduling','scheduled','completed')),
  position    integer,
  joined_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),

  -- A user can only be on the waitlist once per circle (or once globally)
  unique (user_id, circle_id)
);

-- ── Auto-assign position on insert ───────────────────────────────────
create or replace function assign_waitlist_position()
returns trigger language plpgsql as $$
begin
  select coalesce(max(position), 0) + 1
    into new.position
    from circle_waitlist
   where circle_id is not distinct from new.circle_id;
  return new;
end;
$$;

drop trigger if exists waitlist_position_trigger on circle_waitlist;
create trigger waitlist_position_trigger
  before insert on circle_waitlist
  for each row execute procedure assign_waitlist_position();

-- ── Row Level Security ────────────────────────────────────────────────
alter table circles         enable row level security;
alter table circle_waitlist enable row level security;

-- circles: anyone authenticated can read; only service role can write
create policy "circles_read"  on circles for select using (true);
create policy "circles_write" on circles for all    using (auth.role() = 'service_role');

-- waitlist: users can see and manage their own rows; service role sees all
create policy "waitlist_own_read"   on circle_waitlist for select using (auth.uid() = user_id);
create policy "waitlist_own_insert" on circle_waitlist for insert with check (auth.uid() = user_id);
create policy "waitlist_own_delete" on circle_waitlist for delete using (auth.uid() = user_id);
create policy "waitlist_count_read" on circle_waitlist for select using (true); -- needed for count()

-- ── Seed: one forming circle ──────────────────────────────────────────
insert into circles (title, status, min_participants, max_participants)
values ('Next Deep-Dive Circle', 'forming', 6, 12)
on conflict do nothing;
