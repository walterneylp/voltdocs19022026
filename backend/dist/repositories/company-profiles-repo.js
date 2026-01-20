export const listCompanyProfiles = async (client) => {
    const { data, error } = await client
        .from("company_profiles")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createCompanyProfile = async (client, payload) => {
    const { data, error } = await client
        .from("company_profiles")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateCompanyProfile = async (client, id, patch) => {
    const { data, error } = await client
        .from("company_profiles")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const deleteCompanyProfile = async (client, id) => {
    const { data, error } = await client
        .from("company_profiles")
        .delete()
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
