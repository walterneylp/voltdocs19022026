export type AuditConfigItem = {
  item_id: string;
  pasta: string;
  categoria: string;
  nome: string;
  requisitos_minimos: string[];
  campos_obrigatorios: string[];
  evidencias_esperadas: string[];
  palavras_chave: string[];
  raw: Record<string, unknown>;
  config_hash: string;
};

export type AuditConfigMeta = {
  config_hash: string;
  config_version: string | null;
  engine: string | null;
};

export type AuditRun = {
  id: string;
  tenant_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
};

export type AuditResult = {
  id: string;
  run_id: string;
  item_id: string;
  status: string;
  score_percentual: number;
  itens_atendidos: string[];
  itens_faltantes: string[];
  riscos_identificados: string[];
  inconsistencias: string[];
  recomendacoes: string[];
  trechos_evidencia: string[];
};

export type AuditItemEvidence = {
  id: string;
  item_id: string;
  document_id: string;
  tipo_evidencia: string | null;
  observacao: string | null;
  tenant_id: string;
};
