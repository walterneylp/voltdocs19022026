import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Document,
  DocumentVersion,
  DocumentEquipment
} from "../models/document.js";

export const listDocuments = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Document[];
};

export const createDocument = async (
  client: SupabaseClient,
  payload: Omit<Document, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("documents")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Document;
};

export const addDocumentVersion = async (
  client: SupabaseClient,
  payload: Omit<DocumentVersion, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("document_versions")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as DocumentVersion;
};

export const linkDocumentEquipment = async (
  client: SupabaseClient,
  payload: Omit<DocumentEquipment, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("document_equipments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as DocumentEquipment;
};

export const listDocumentEquipments = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("document_equipments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DocumentEquipment[];
};

export const listDocumentVersions = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("document_versions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DocumentVersion[];
};

export const getDocumentVersionById = async (client: SupabaseClient, id: string) => {
  const { data, error } = await client
    .from("document_versions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as DocumentVersion;
};

export const deleteDocumentVersion = async (client: SupabaseClient, id: string) => {
  const { error } = await client.from("document_versions").delete().eq("id", id);
  if (error) throw error;
};

export const updateDocument = async (
  client: SupabaseClient,
  id: string,
  patch: Partial<Omit<Document, "id" | "created_at" | "tenant_id">>
) => {
  const { data, error } = await client
    .from("documents")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Document;
};

export const deleteDocument = async (client: SupabaseClient, id: string) => {
  const { error } = await client.from("documents").delete().eq("id", id);
  if (error) throw error;
};

export const deleteDocumentEquipments = async (
  client: SupabaseClient,
  documentId: string,
  equipmentIds: string[]
) => {
  if (equipmentIds.length === 0) return;
  const { error } = await client
    .from("document_equipments")
    .delete()
    .eq("document_id", documentId)
    .in("equipment_id", equipmentIds);
  if (error) throw error;
};

export const deleteAllDocumentEquipments = async (
  client: SupabaseClient,
  documentId: string
) => {
  const { error } = await client
    .from("document_equipments")
    .delete()
    .eq("document_id", documentId);
  if (error) throw error;
};

export const deleteDocumentVersions = async (client: SupabaseClient, documentId: string) => {
  const { error } = await client
    .from("document_versions")
    .delete()
    .eq("document_id", documentId);
  if (error) throw error;
};
