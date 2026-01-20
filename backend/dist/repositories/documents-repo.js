export const listDocuments = async (client) => {
    const { data, error } = await client
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createDocument = async (client, payload) => {
    const { data, error } = await client
        .from("documents")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const addDocumentVersion = async (client, payload) => {
    const { data, error } = await client
        .from("document_versions")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const linkDocumentEquipment = async (client, payload) => {
    const { data, error } = await client
        .from("document_equipments")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const listDocumentEquipments = async (client) => {
    const { data, error } = await client
        .from("document_equipments")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const listDocumentVersions = async (client) => {
    const { data, error } = await client
        .from("document_versions")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const getDocumentVersionById = async (client, id) => {
    const { data, error } = await client
        .from("document_versions")
        .select("*")
        .eq("id", id)
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteDocumentVersion = async (client, id) => {
    const { error } = await client.from("document_versions").delete().eq("id", id);
    if (error)
        throw error;
};
export const updateDocument = async (client, id, patch) => {
    const { data, error } = await client
        .from("documents")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteDocument = async (client, id) => {
    const { error } = await client.from("documents").delete().eq("id", id);
    if (error)
        throw error;
};
export const deleteDocumentEquipments = async (client, documentId, equipmentIds) => {
    if (equipmentIds.length === 0)
        return;
    const { error } = await client
        .from("document_equipments")
        .delete()
        .eq("document_id", documentId)
        .in("equipment_id", equipmentIds);
    if (error)
        throw error;
};
export const deleteAllDocumentEquipments = async (client, documentId) => {
    const { error } = await client
        .from("document_equipments")
        .delete()
        .eq("document_id", documentId);
    if (error)
        throw error;
};
export const deleteDocumentVersions = async (client, documentId) => {
    const { error } = await client
        .from("document_versions")
        .delete()
        .eq("document_id", documentId);
    if (error)
        throw error;
};
