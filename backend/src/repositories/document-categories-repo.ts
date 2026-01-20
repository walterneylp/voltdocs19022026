import type { SupabaseClient } from "@supabase/supabase-js";

export type DocumentCategory = {
  id: string;
  code: string;
  name: string;
  tenant_id: string;
  created_at: string;
};

export const listDocumentCategories = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("document_categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as DocumentCategory[];
};

export const createDocumentCategory = async (
  client: SupabaseClient,
  payload: Omit<DocumentCategory, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("document_categories")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as DocumentCategory;
};

export const updateDocumentCategory = async (
  client: SupabaseClient,
  id: string,
  payload: Pick<DocumentCategory, "code" | "name">
) => {
  const { data, error } = await client
    .from("document_categories")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as DocumentCategory;
};

export const deleteDocumentCategory = async (client: SupabaseClient, id: string) => {
  const { error } = await client.from("document_categories").delete().eq("id", id);
  if (error) throw error;
};

export const getDocumentCategory = async (client: SupabaseClient, id: string) => {
  const { data, error } = await client
    .from("document_categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DocumentCategory;
};

export const countDocumentsByCategory = async (
  client: SupabaseClient,
  tenantId: string,
  names: string[]
) => {
  const normalized = names.filter((name) => name.trim().length > 0);
  if (normalized.length === 0) return 0;
  const { count, error } = await client
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .in("category", normalized);
  if (error) throw error;
  return count ?? 0;
};
