export const listProfiles = async (client) => {
    const { data, error } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const listUserGroups = async (client) => {
    const { data, error } = await client
        .from("user_groups")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createUserGroup = async (client, payload) => {
    const { data, error } = await client
        .from("user_groups")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateUserGroup = async (client, id, payload) => {
    const { data, error } = await client
        .from("user_groups")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const addUserGroupMember = async (client, payload) => {
    const { data, error } = await client
        .from("user_group_members")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const listUserGroupMembers = async (client) => {
    const { data, error } = await client
        .from("user_group_members")
        .select("*")
        .order("user_id", { ascending: true });
    if (error)
        throw error;
    return data;
};
