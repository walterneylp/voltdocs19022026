import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ticket, TicketGroupAssignment } from "../models/ticket.js";

export const listTickets = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Ticket[];
};

export const createTicket = async (
  client: SupabaseClient,
  payload: Omit<Ticket, "id" | "created_at" | "updated_at">
) => {
  const { data, error } = await client
    .from("tickets")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Ticket;
};

export const updateTicket = async (
  client: SupabaseClient,
  id: string,
  patch: Partial<Omit<Ticket, "id" | "tenant_id" | "created_at" | "updated_at">>
) => {
  const { data, error } = await client
    .from("tickets")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Ticket;
};

export const assignTicketGroup = async (
  client: SupabaseClient,
  payload: TicketGroupAssignment
) => {
  const { data, error } = await client
    .from("ticket_group_assignments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as TicketGroupAssignment;
};
