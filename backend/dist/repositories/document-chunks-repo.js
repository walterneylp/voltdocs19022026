export const clearDocumentChunks = async (client, tenantId) => {
    const { error } = await client.from("document_chunks").delete().eq("tenant_id", tenantId);
    if (error)
        throw error;
};
export const insertDocumentChunks = async (client, rows) => {
    if (rows.length === 0)
        return [];
    const { data, error } = await client.from("document_chunks").insert(rows).select("id");
    if (error)
        throw error;
    return data ?? [];
};
export const searchDocumentChunks = async (client, tenantId, embedding, matchCount) => {
    const { data, error } = await client.rpc("match_document_chunks", {
        tenant_id: tenantId,
        query_embedding: embedding,
        match_count: matchCount
    });
    if (error)
        throw error;
    return data;
};
