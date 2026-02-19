export const getAuditConfigMeta = async (client) => {
    const { data, error } = await client
        .from("audit_config_meta")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error)
        throw error;
    return data;
};
export const upsertAuditConfigMeta = async (client, meta) => {
    const { data, error } = await client
        .from("audit_config_meta")
        .upsert(meta, { onConflict: "engine" })
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const upsertAuditConfigItems = async (client, items) => {
    const { data, error } = await client
        .from("audit_config_items")
        .upsert(items, { onConflict: "item_id" })
        .select("*");
    if (error)
        throw error;
    return data;
};
export const listAuditConfigItems = async (client) => {
    const { data, error } = await client
        .from("audit_config_items")
        .select("*")
        .in("item_id", ["1.1", "1.2", "1.3", "1.4", "1.5"])
        .order("item_id", { ascending: true });
    if (error)
        throw error;
    return data;
};
export const createAuditRun = async (client, payload) => {
    const { data, error } = await client
        .from("audit_runs")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const finishAuditRun = async (client, runId, payload) => {
    const { data, error } = await client
        .from("audit_runs")
        .update(payload)
        .eq("id", runId)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const insertAuditResults = async (client, results) => {
    const { data, error } = await client
        .from("audit_results")
        .insert(results)
        .select("*");
    if (error)
        throw error;
    return data;
};
export const listLatestAuditResults = async (client, tenantId) => {
    const { data: latestRun, error: runError } = await client
        .from("audit_runs")
        .select("id")
        .eq("tenant_id", tenantId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (runError)
        throw runError;
    if (!latestRun?.id)
        return { run: null, results: [] };
    const { data, error } = await client
        .from("audit_results")
        .select("*")
        .eq("run_id", latestRun.id)
        .order("item_id", { ascending: true });
    if (error)
        throw error;
    return { run: latestRun, results: (data ?? []) };
};
export const listAuditItemEvidences = async (client, itemId) => {
    const { data, error } = await client
        .from("audit_item_evidences")
        .select("id,item_id,document_id,tipo_evidencia,observacao,tenant_id,created_at,documents(id,title,category)")
        .eq("item_id", itemId);
    if (error)
        throw error;
    return data;
};
export const insertAuditItemEvidence = async (client, payload) => {
    const { data, error } = await client
        .from("audit_item_evidences")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteAuditItemEvidence = async (client, evidenceId) => {
    const { error } = await client.from("audit_item_evidences").delete().eq("id", evidenceId);
    if (error)
        throw error;
};
export const listAuditItemEvidenceIds = async (client, itemId) => {
    const { data, error } = await client
        .from("audit_item_evidences")
        .select("document_id")
        .eq("item_id", itemId);
    if (error)
        throw error;
    return (data ?? []).map((row) => row.document_id);
};
export const insertAuditItemEvidenceExclusion = async (client, payload) => {
    const { error } = await client
        .from("audit_item_evidence_exclusions")
        .upsert({
        tenant_id: payload.tenant_id,
        item_id: payload.item_id,
        document_id: payload.document_id,
        reason: payload.reason ?? null
    }, { onConflict: "tenant_id,item_id,document_id" });
    if (error)
        throw error;
};
export const listAuditItemEvidenceExclusions = async (client, tenantId, itemId) => {
    const { data, error } = await client
        .from("audit_item_evidence_exclusions")
        .select("document_id")
        .eq("tenant_id", tenantId)
        .eq("item_id", itemId);
    if (error)
        throw error;
    return (data ?? []).map((row) => row.document_id);
};
export const listAuditEvidencesForItems = async (client, itemIds) => {
    const { data, error } = await client
        .from("audit_item_evidences")
        .select("id,item_id,document_id,tipo_evidencia,observacao,tenant_id,documents(id,title,category)")
        .in("item_id", itemIds);
    if (error)
        throw error;
    return data;
};
