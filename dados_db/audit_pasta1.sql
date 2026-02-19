-- VoltDocs - Auditoria Pasta 1 (Identificação da Empresa)
-- Cria tabelas para configuração, evidências e resultados da auditoria.

create extension if not exists "pgcrypto";
create extension if not exists vector;

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index int not null default 0,
  content text not null,
  embedding vector(1536),
  source jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_tenant_id_idx on document_chunks(tenant_id);
create index if not exists document_chunks_document_id_idx on document_chunks(document_id);
create index if not exists document_chunks_embedding_idx on document_chunks using ivfflat (embedding vector_cosine_ops);

create or replace function match_document_chunks(
  tenant_id uuid,
  query_embedding vector(1536),
  match_count int default 5
)
returns table(
  id uuid,
  document_id uuid,
  content text,
  source jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.source,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.tenant_id = match_document_chunks.tenant_id
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;

create table if not exists audit_config_meta (
  id uuid primary key default gen_random_uuid(),
  engine text unique,
  config_hash text not null,
  config_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_config_items (
  item_id text primary key,
  pasta text not null,
  categoria text not null,
  nome text not null,
  requisitos_minimos jsonb not null default '[]'::jsonb,
  campos_obrigatorios jsonb not null default '[]'::jsonb,
  evidencias_esperadas jsonb not null default '[]'::jsonb,
  palavras_chave jsonb not null default '[]'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  config_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists audit_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references audit_runs(id) on delete cascade,
  item_id text not null references audit_config_items(item_id) on delete cascade,
  status text not null,
  score_percentual int not null default 0,
  itens_atendidos jsonb not null default '[]'::jsonb,
  itens_faltantes jsonb not null default '[]'::jsonb,
  riscos_identificados jsonb not null default '[]'::jsonb,
  inconsistencias jsonb not null default '[]'::jsonb,
  recomendacoes jsonb not null default '[]'::jsonb,
  trechos_evidencia jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_item_evidences (
  id uuid primary key default gen_random_uuid(),
  item_id text not null references audit_config_items(item_id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  tipo_evidencia text,
  observacao text,
  tenant_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_config_items_item_id_idx on audit_config_items(item_id);
create index if not exists audit_runs_tenant_id_idx on audit_runs(tenant_id);
create index if not exists audit_results_run_id_idx on audit_results(run_id);
create index if not exists audit_results_item_id_idx on audit_results(item_id);
create index if not exists audit_item_evidences_item_id_idx on audit_item_evidences(item_id);
create index if not exists audit_item_evidences_document_id_idx on audit_item_evidences(document_id);
