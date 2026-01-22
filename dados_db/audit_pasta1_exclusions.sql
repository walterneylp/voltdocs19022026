create table if not exists audit_item_evidence_exclusions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  item_id text not null,
  document_id uuid not null references documents(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists audit_item_evidence_exclusions_unique
  on audit_item_evidence_exclusions (tenant_id, item_id, document_id);

create index if not exists audit_item_evidence_exclusions_item_idx
  on audit_item_evidence_exclusions (tenant_id, item_id);
