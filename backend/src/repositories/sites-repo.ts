import type { SupabaseClient } from "@supabase/supabase-js";
import type { Site } from "../models/site.js";

export const listSites = async (client: SupabaseClient) => {
  const { data, error } = await client.from("sites").select("*").order("name");
  if (error) throw error;
  return data as Site[];
};

export const createSite = async (
  client: SupabaseClient,
  payload: Omit<Site, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("sites")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Site;
};

export const updateSite = async (
  client: SupabaseClient,
  id: string,
  patch: Partial<Omit<Site, "id" | "tenant_id" | "created_at">>
) => {
  const { data, error } = await client
    .from("sites")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Site;
};

export const deleteSite = async (client: SupabaseClient, id: string) => {
  const { data, error } = await client.from("sites").delete().eq("id", id).select("*").single();
  if (error) throw error;
  return data as Site;
};
