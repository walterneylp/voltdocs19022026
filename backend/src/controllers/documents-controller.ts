import type { Request, Response } from "express";
import { z } from "zod";
import {
  addDocumentVersion,
  createDocument,
  deleteDocument,
  deleteAllDocumentEquipments,
  deleteDocumentEquipments,
  deleteDocumentVersions,
  deleteDocumentVersion,
  linkDocumentEquipment,
  listDocumentEquipments,
  listDocumentVersions,
  listDocuments,
  getDocumentVersionById,
  updateDocument
} from "../repositories/documents-repo.js";
import { createSignedStorageUrl, removeFromSupabaseStorage } from "../lib/storage.js";

const splitStoragePath = (filePath: string) => {
  const parts = filePath.split("/");
  if (parts.length > 1) {
    return { bucket: parts[0], key: parts.slice(1).join("/") };
  }
  return { bucket: undefined, key: filePath };
};

const documentCreateSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1).optional(),
  category_id: z.string().uuid().nullable().optional(),
  equipment_id: z.string().uuid().nullable().optional(),
  tenant_id: z.string().uuid()
});

const documentVersionCreateSchema = z.object({
  document_id: z.string().uuid(),
  version: z.string().min(1),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  tenant_id: z.string().uuid()
});

const documentLinkSchema = z.object({
  document_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable().optional()
});

const documentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  category_id: z.string().uuid().nullable().optional()
});

const documentUnlinkSchema = z.object({
  document_id: z.string().uuid(),
  equipment_ids: z.array(z.string().uuid())
});

export const getDocuments = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const docs = await listDocuments(client);
  res.json({ data: docs });
};

export const postDocument = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = documentCreateSchema.parse(req.body);
  let categoryName = payload.category ?? null;

  if (!categoryName && payload.category_id) {
    const { data: categoryData, error } = await client
      .from("document_categories")
      .select("name")
      .eq("id", payload.category_id)
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    categoryName = categoryData?.name ?? null;
  }

  if (!categoryName) {
    res.status(400).json({ error: "Categoria obrigatoria." });
    return;
  }
  const doc = await createDocument(client, {
    ...payload,
    equipment_id: payload.equipment_id ?? null,
    category: categoryName,
    category_id: payload.category_id ?? null
  });
  res.status(201).json({ data: doc });
};

export const postDocumentVersion = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = documentVersionCreateSchema.parse(req.body);
  const version = await addDocumentVersion(client, {
    ...payload,
    valid_from: payload.valid_from ?? null,
    valid_until: payload.valid_until ?? null
  });
  res.status(201).json({ data: version });
};

export const postDocumentLink = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = documentLinkSchema.parse(req.body);
  const link = await linkDocumentEquipment(client, {
    ...payload,
    tenant_id: payload.tenant_id ?? null
  });
  res.status(201).json({ data: link });
};

export const deleteDocumentLinks = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = documentUnlinkSchema.parse(req.body);
  await deleteDocumentEquipments(client, payload.document_id, payload.equipment_ids);
  res.status(204).send();
};

export const getDocumentEquipments = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const links = await listDocumentEquipments(client);
  res.json({ data: links });
};

export const getDocumentVersions = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const versions = await listDocumentVersions(client);
  res.json({ data: versions });
};

export const getDocumentVersionUrl = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Versao invalida." });
  const version = await getDocumentVersionById(client, id);
  const { bucket, key } = splitStoragePath(version.file_path);
  const signedUrl = await createSignedStorageUrl(key, 600, bucket);
  res.json({ data: { url: signedUrl } });
};

export const removeDocumentVersion = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Versao invalida." });
  const version = await getDocumentVersionById(client, id);
  const { bucket, key } = splitStoragePath(version.file_path);
  await removeFromSupabaseStorage(key, bucket);
  await deleteDocumentVersion(client, id);
  res.status(204).send();
};

export const patchDocument = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Documento invalido." });
  const payload = documentUpdateSchema.parse(req.body);
  let categoryName = payload.category ?? undefined;
  if (!categoryName && payload.category_id) {
    const { data: categoryData, error } = await client
      .from("document_categories")
      .select("name")
      .eq("id", payload.category_id)
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    categoryName = categoryData?.name ?? undefined;
  }
  const updated = await updateDocument(client, id, {
    title: payload.title,
    category: categoryName,
    category_id: payload.category_id
  });
  res.json({ data: updated });
};

export const removeDocument = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Documento invalido." });
  await deleteAllDocumentEquipments(client, id);
  await deleteDocumentVersions(client, id);
  await deleteDocument(client, id);
  res.status(204).send();
};
