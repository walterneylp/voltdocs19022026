import type { Request, Response } from "express";
import { z } from "zod";
import { createSite, deleteSite, listSites, updateSite } from "../repositories/sites-repo.js";

const siteCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  tenant_id: z.string().uuid()
});

const siteUpdateSchema = siteCreateSchema.partial().omit({ tenant_id: true });

export const getSites = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const sites = await listSites(client);
  res.json({ data: sites });
};

export const postSite = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const payload = siteCreateSchema.parse(req.body);
  const site = await createSite(client, {
    ...payload,
    address: payload.address ?? null
  });
  res.status(201).json({ data: site });
};

export const patchSite = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const siteId = z.string().uuid().parse(req.params.id);
  const patch = siteUpdateSchema.parse(req.body);
  const site = await updateSite(client, siteId, patch);
  res.json({ data: site });
};

export const removeSite = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });
  const siteId = z.string().uuid().parse(req.params.id);
  const site = await deleteSite(client, siteId);
  res.json({ data: site });
};
