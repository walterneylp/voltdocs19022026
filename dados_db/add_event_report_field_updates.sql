alter table public.field_updates
  add column if not exists event_report boolean not null default false;
