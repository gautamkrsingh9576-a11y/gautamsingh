-- E-TECH Trend Radar
-- Append-only analytics schema with a minimum 30-day history window.
-- Raw observation rows are NOT automatically deleted by this schema.

create extension if not exists pgcrypto;

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running','success','failed')),
  youtube_count integer not null default 0,
  deal_count integer not null default 0,
  idea_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.trend_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  kind text not null default 'video',
  title text not null,
  url text,
  author_name text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source, external_id)
);

create table if not exists public.trend_observations (
  id bigint generated always as identity primary key,
  trend_item_id uuid not null references public.trend_items(id) on delete cascade,
  run_id uuid references public.automation_runs(id) on delete set null,
  views bigint,
  likes bigint,
  comments bigint,
  views_per_hour numeric,
  trend_score numeric not null default 0,
  raw_payload jsonb,
  observed_at timestamptz not null default now()
);

create index if not exists trend_observations_item_time_idx
  on public.trend_observations(trend_item_id, observed_at desc);
create index if not exists trend_observations_time_idx
  on public.trend_observations(observed_at desc);
create index if not exists trend_observations_score_idx
  on public.trend_observations(trend_score desc);

create table if not exists public.deal_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  title text not null,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source, external_id)
);

create table if not exists public.deal_observations (
  id bigint generated always as identity primary key,
  deal_item_id uuid not null references public.deal_items(id) on delete cascade,
  run_id uuid references public.automation_runs(id) on delete set null,
  price numeric,
  currency text not null default 'INR',
  discount_pct numeric,
  sales_rank integer,
  deal_score numeric not null default 0,
  raw_payload jsonb,
  observed_at timestamptz not null default now()
);

create index if not exists deal_observations_item_time_idx
  on public.deal_observations(deal_item_id, observed_at desc);
create index if not exists deal_observations_time_idx
  on public.deal_observations(observed_at desc);
create index if not exists deal_observations_score_idx
  on public.deal_observations(deal_score desc);

create table if not exists public.video_ideas (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.automation_runs(id) on delete set null,
  topic text not null,
  suggested_title text not null,
  hook text not null,
  angle text,
  why_now text,
  video_format text,
  priority_score integer check (priority_score between 0 and 100),
  evidence_urls jsonb not null default '[]'::jsonb,
  status text not null default 'new'
    check (status in ('new','shortlisted','planned','published','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists video_ideas_created_idx
  on public.video_ideas(created_at desc);
create index if not exists video_ideas_priority_idx
  on public.video_ideas(priority_score desc);

-- Daily convenience views.
-- They select the latest observation for each item on each UTC date,
-- while preserving every raw observation row underneath.

create or replace view public.dashboard_trend_history_30d as
select distinct on (o.trend_item_id, (o.observed_at at time zone 'UTC')::date)
  o.trend_item_id,
  i.title,
  i.source,
  i.author_name,
  i.url,
  (o.observed_at at time zone 'UTC')::date as observed_date,
  o.observed_at,
  o.views,
  o.likes,
  o.comments,
  o.views_per_hour,
  o.trend_score
from public.trend_observations o
join public.trend_items i on i.id = o.trend_item_id
where o.observed_at >= now() - interval '30 days'
order by o.trend_item_id, (o.observed_at at time zone 'UTC')::date, o.observed_at desc;

create or replace view public.dashboard_deal_history_30d as
select distinct on (o.deal_item_id, (o.observed_at at time zone 'UTC')::date)
  o.deal_item_id,
  i.title,
  i.source,
  i.url,
  (o.observed_at at time zone 'UTC')::date as observed_date,
  o.observed_at,
  o.price,
  o.currency,
  o.discount_pct,
  o.sales_rank,
  o.deal_score
from public.deal_observations o
join public.deal_items i on i.id = o.deal_item_id
where o.observed_at >= now() - interval '30 days'
order by o.deal_item_id, (o.observed_at at time zone 'UTC')::date, o.observed_at desc;

-- Read-only browser access for the static dashboard.
-- Writes should use a server-side/service-role key in GitHub Actions only.

alter table public.automation_runs enable row level security;
alter table public.trend_items enable row level security;
alter table public.trend_observations enable row level security;
alter table public.deal_items enable row level security;
alter table public.deal_observations enable row level security;
alter table public.video_ideas enable row level security;

drop policy if exists "dashboard read automation_runs" on public.automation_runs;
create policy "dashboard read automation_runs" on public.automation_runs
  for select to anon, authenticated using (true);

drop policy if exists "dashboard read trend_items" on public.trend_items;
create policy "dashboard read trend_items" on public.trend_items
  for select to anon, authenticated using (true);

drop policy if exists "dashboard read trend_observations" on public.trend_observations;
create policy "dashboard read trend_observations" on public.trend_observations
  for select to anon, authenticated using (true);

drop policy if exists "dashboard read deal_items" on public.deal_items;
create policy "dashboard read deal_items" on public.deal_items
  for select to anon, authenticated using (true);

drop policy if exists "dashboard read deal_observations" on public.deal_observations;
create policy "dashboard read deal_observations" on public.deal_observations
  for select to anon, authenticated using (true);

drop policy if exists "dashboard read video_ideas" on public.video_ideas;
create policy "dashboard read video_ideas" on public.video_ideas
  for select to anon, authenticated using (true);

grant select on public.automation_runs to anon, authenticated;
grant select on public.trend_items to anon, authenticated;
grant select on public.trend_observations to anon, authenticated;
grant select on public.deal_items to anon, authenticated;
grant select on public.deal_observations to anon, authenticated;
grant select on public.video_ideas to anon, authenticated;
grant select on public.dashboard_trend_history_30d to anon, authenticated;
grant select on public.dashboard_deal_history_30d to anon, authenticated;

-- IMPORTANT:
-- No DELETE job is included. Data is preserved beyond 30 days unless you later
-- choose to add an archive/cleanup policy. The dashboard simply displays 30 days.
