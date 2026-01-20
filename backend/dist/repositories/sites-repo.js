export const listSites = async (client) => {
    const { data, error } = await client.from("sites").select("*").order("name");
    if (error)
        throw error;
    return data;
};
export const createSite = async (client, payload) => {
    const { data, error } = await client
        .from("sites")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateSite = async (client, id, patch) => {
    const { data, error } = await client
        .from("sites")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteSite = async (client, id) => {
    const { data, error } = await client.from("sites").delete().eq("id", id).select("*").single();
    if (error)
        throw error;
    return data;
};
