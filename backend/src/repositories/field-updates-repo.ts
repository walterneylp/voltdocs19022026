import type { SupabaseClient } from "@supabase/supabase-js";
import type { FieldUpdate } from "../models/field-update.js";

export const listFieldUpdates = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("field_updates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as FieldUpdate[];
};

export const createFieldUpdate = async (
  client: SupabaseClient,
  payload: Omit<FieldUpdate, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("field_updates")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as FieldUpdate;
};

export const closeFieldUpdate = async (
  client: SupabaseClient,
  id: string,
  patch: Pick<FieldUpdate, "status" | "close_note" | "closed_at" | "closed_by_id" | "closed_by_name">
) => {
  const { data, error } = await client
    .from("field_updates")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as FieldUpdate;
};
