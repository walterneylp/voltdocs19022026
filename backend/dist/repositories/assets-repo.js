export const listAssets = async (client) => {
    const { data, error } = await client
        .from("assets")
        .select("*")
        .order("updated_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createAsset = async (client, payload) => {
    const { data, error } = await client
        .from("assets")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateAsset = async (client, id, patch) => {
    const { data, error } = await client
        .from("assets")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteAsset = async (client, id) => {
    const { data, error } = await client.from("assets").delete().eq("id", id).select("*").single();
    if (error)
        throw error;
    return data;
};
