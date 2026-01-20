import type { Request, Response } from "express";
import { z } from "zod";
import { listAssets, createAsset, updateAsset, deleteAsset } from "../repositories/assets-repo.js";

const assetCreateSchema = z.object({
  tag: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  patrimony_number: z.string().nullable().optional(),
  voltage: z.string().nullable().optional(),
  current_rating: z.number().nullable().optional(),
  atpv: z.number().nullable().optional(),
  risk_level: z.string().nullable().optional(),
  site_id: z.string().uuid().nullable().optional(),
  tenant_id: z.string().uuid()
});

const assetUpdateSchema = assetCreateSchema.partial().omit({ tenant_id: true });

export const getAssets = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const assets = await listAssets(client);
  res.json({ data: assets });
};

export const postAsset = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = assetCreateSchema.parse(req.body);
  const asset = await createAsset(client, {
    ...payload,
    description: payload.description ?? null,
    patrimony_number: payload.patrimony_number ?? null,
    voltage: payload.voltage ?? null,
    current_rating: payload.current_rating ?? null,
    atpv: payload.atpv ?? null,
    risk_level: payload.risk_level ?? null,
    site_id: payload.site_id ?? null
  });
  res.status(201).json({ data: asset });
};

export const patchAsset = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const assetId = z.string().uuid().parse(req.params.id);
  const patch = assetUpdateSchema.parse(req.body);
  const asset = await updateAsset(client, assetId, patch);
  res.json({ data: asset });
};

export const removeAsset = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const assetId = z.string().uuid().parse(req.params.id);
  const asset = await deleteAsset(client, assetId);
  res.json({ data: asset });
};
