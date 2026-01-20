import type { SupabaseClient } from "@supabase/supabase-js";
import type { Asset } from "../models/asset.js";

export const listAssets = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("assets")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Asset[];
};

export const createAsset = async (
  client: SupabaseClient,
  payload: Omit<Asset, "id" | "updated_at" | "qr_code_uuid">
) => {
  const { data, error } = await client
    .from("assets")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Asset;
};

export const updateAsset = async (
  client: SupabaseClient,
  id: string,
  patch: Partial<Omit<Asset, "id" | "tenant_id" | "updated_at" | "qr_code_uuid">>
) => {
  const { data, error } = await client
    .from("assets")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Asset;
};

export const deleteAsset = async (client: SupabaseClient, id: string) => {
  const { data, error } = await client.from("assets").delete().eq("id", id).select("*").single();
  if (error) throw error;
  return data as Asset;
};
