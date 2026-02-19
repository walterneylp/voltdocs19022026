import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { env } from "../config/env.js";

type AuditConfigItemRaw = {
  item_id: string;
  pasta: string;
  categoria: string;
  nome: string;
  requisitos_minimos?: string[];
  campos_obrigatorios?: string[];
  evidencias_esperadas?: string[];
  palavras_chave?: string[];
  [key: string]: unknown;
};

type AuditConfigRaw = {
  version?: string;
  engine?: string;
  items?: AuditConfigItemRaw[];
};

export const loadAuditConfig = async () => {
  const configPath = env.AUDIT_CONFIG_PATH ?? "dados_avulsos/pie.json";
  const filePath = resolve(process.cwd(), configPath);
  const content = await readFile(filePath, "utf-8");
  const raw = JSON.parse(content) as AuditConfigRaw;
  const items = (raw.items ?? []).filter((item) =>
    ["1.1", "1.2", "1.3", "1.4", "1.5"].includes(item.item_id)
  );
  const hash = createHash("sha256").update(JSON.stringify(items)).digest("hex");
  return {
    config_hash: hash,
    config_version: raw.version ?? null,
    engine: raw.engine ?? null,
    items
  };
};
