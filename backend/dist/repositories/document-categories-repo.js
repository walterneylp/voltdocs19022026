export const listDocumentCategories = async (client) => {
    const { data, error } = await client
        .from("document_categories")
        .select("*")
        .order("name");
    if (error)
        throw error;
    return data;
};
export const createDocumentCategory = async (client, payload) => {
    const { data, error } = await client
        .from("document_categories")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateDocumentCategory = async (client, id, payload) => {
    const { data, error } = await client
        .from("document_categories")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteDocumentCategory = async (client, id) => {
    const { error } = await client.from("document_categories").delete().eq("id", id);
    if (error)
        throw error;
};
export const getDocumentCategory = async (client, id) => {
    const { data, error } = await client
        .from("document_categories")
        .select("*")
        .eq("id", id)
        .single();
    if (error)
        throw error;
    return data;
};
export const countDocumentsByCategory = async (client, tenantId, names) => {
    const normalized = names.filter((name) => name.trim().length > 0);
    if (normalized.length === 0)
        return 0;
    const { count, error } = await client
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .in("category", normalized);
    if (error)
        throw error;
    return count ?? 0;
};
