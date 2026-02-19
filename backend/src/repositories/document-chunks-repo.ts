import type { SupabaseClient } from "@supabase/supabase-js";

export type DocumentChunkInsert = {
  tenant_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  source: Record<string, unknown>;
};

export const clearDocumentChunks = async (client: SupabaseClient, tenantId: string) => {
  const { error } = await client.from("document_chunks").delete().eq("tenant_id", tenantId);
  if (error) throw error;
};

export const insertDocumentChunks = async (
  client: SupabaseClient,
  rows: DocumentChunkInsert[]
) => {
  if (rows.length === 0) return [];
  const { data, error } = await client.from("document_chunks").insert(rows).select("id");
  if (error) throw error;
  return data ?? [];
};

export const searchDocumentChunks = async (
  client: SupabaseClient,
  tenantId: string,
  embedding: number[],
  matchCount: number
) => {
  const { data, error } = await client.rpc("match_document_chunks", {
    tenant_id: tenantId,
    query_embedding: embedding,
    match_count: matchCount
  });
  if (error) throw error;
  return data as Array<{
    id: string;
    document_id: string;
    content: string;
    source: Record<string, unknown>;
    similarity: number;
  }>;
};
