export const listFieldUpdates = async (client) => {
    const { data, error } = await client
        .from("field_updates")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createFieldUpdate = async (client, payload) => {
    const { data, error } = await client
        .from("field_updates")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const closeFieldUpdate = async (client, id, patch) => {
    const { data, error } = await client
        .from("field_updates")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
