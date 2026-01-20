import type { Request, Response } from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
const passwordSchema = z.object({
  password: z.string().min(6)
});
const refreshSchema = z.object({
  refresh_token: z.string().min(10)
});

export const login = async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  if (!env.SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Missing SUPABASE_ANON_KEY" });
    return;
  }
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? "", {
    auth: { persistSession: false }
  });

  const { data, error } = await client.auth.signInWithPassword(payload);
  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }
  if (data.user?.user_metadata?.blocked) {
    res.status(403).json({
      error: "Usuario bloqueado.",
      reason: data.user.user_metadata?.blocked_reason ?? null
    });
    return;
  }

  res.json({
    data: {
      access_token: data.session?.access_token ?? "",
      refresh_token: data.session?.refresh_token ?? "",
      user: data.user
    }
  });
};

export const me = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });

  const { data: userData, error } = await client.auth.getUser();
  if (error || !userData.user) {
    res.status(401).json({ error: error?.message ?? "Unauthorized" });
    return;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.json({ data: { user: userData.user, profile } });
};

export const updatePassword = async (req: Request, res: Response) => {
  const client = req.supabase;
  if (!client) return res.status(500).json({ error: "Missing supabase client" });

  const payload = passwordSchema.parse(req.body);
  const { data, error } = await client.auth.updateUser({ password: payload.password });
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ data });
};

export const refreshSession = async (req: Request, res: Response) => {
  const payload = refreshSchema.parse(req.body);
  if (!env.SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Missing SUPABASE_ANON_KEY" });
    return;
  }
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  const { data, error } = await client.auth.refreshSession({
    refresh_token: payload.refresh_token
  });
  if (error || !data.session) {
    res.status(401).json({ error: error?.message ?? "Refresh failed" });
    return;
  }
  res.json({
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    }
  });
};
