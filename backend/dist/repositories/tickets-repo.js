export const listTickets = async (client) => {
    const { data, error } = await client
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
    if (error)
        throw error;
    return data;
};
export const createTicket = async (client, payload) => {
    const { data, error } = await client
        .from("tickets")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const updateTicket = async (client, id, patch) => {
    const { data, error } = await client
        .from("tickets")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
export const assignTicketGroup = async (client, payload) => {
    const { data, error } = await client
        .from("ticket_group_assignments")
        .insert(payload)
        .select("*")
        .single();
    if (error)
        throw error;
    return data;
};
