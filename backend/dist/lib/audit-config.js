import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { env } from "../config/env.js";
export const loadAuditConfig = async () => {
    const configPath = env.AUDIT_CONFIG_PATH ?? "dados_avulsos/pie.json";
    const filePath = resolve(process.cwd(), configPath);
    const content = await readFile(filePath, "utf-8");
    const raw = JSON.parse(content);
    const items = (raw.items ?? []).filter((item) => ["1.1", "1.2", "1.3", "1.4", "1.5"].includes(item.item_id));
    const hash = createHash("sha256").update(JSON.stringify(items)).digest("hex");
    return {
        config_hash: hash,
        config_version: raw.version ?? null,
        engine: raw.engine ?? null,
        items
    };
};
