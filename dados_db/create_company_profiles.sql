create extension if not exists "pgcrypto";

create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  legal_name text not null,
  trade_name text,
  cnpj text not null,
  state_registration text,
  municipal_registration text,
  email text,
  phone text,
  website text,
  address_street text,
  address_number text,
  address_complement text,
  address_district text,
  address_city text,
  address_state text,
  address_zip text,
  created_at timestamptz not null default now()
);

create index if not exists company_profiles_tenant_idx on public.company_profiles (tenant_id);

alter table public.company_profiles enable row level security;

create policy "company_profiles_select" on public.company_profiles
  for select
  using ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid = tenant_id);

create policy "company_profiles_insert" on public.company_profiles
  for insert
  with check ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid = tenant_id);

create policy "company_profiles_update" on public.company_profiles
  for update
  using ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid = tenant_id)
  with check ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid = tenant_id);

create policy "company_profiles_delete" on public.company_profiles
  for delete
  using ((auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid = tenant_id);
