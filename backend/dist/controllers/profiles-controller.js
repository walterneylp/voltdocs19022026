import { z } from "zod";
import { createUserGroup, listProfiles, listUserGroups, listUserGroupMembers, updateUserGroup } from "../repositories/profiles-repo.js";
import { supabaseAdmin } from "../lib/supabase.js";
const decodeJwtPayload = (token) => {
    const parts = token.split(".");
    if (parts.length < 2)
        return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + (4 - (payload.length % 4 || 4)) % 4, "=");
    try {
        const json = Buffer.from(padded, "base64").toString("utf8");
        return JSON.parse(json);
    }
    catch {
        return null;
    }
};
const userGroupCreateSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    tenant_id: z.string().uuid()
});
const groupMemberSchema = z.object({
    user_id: z.string().uuid(),
    group_id: z.string().uuid(),
    tenant_id: z.string().uuid()
});
const groupMemberDeleteSchema = z.object({
    user_id: z.string().uuid(),
    group_id: z.string().uuid()
});
const groupUpdateSchema = z.object({
    description: z.string().nullable().optional()
});
export const getProfiles = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    if (supabaseAdmin && req.accessToken) {
        const payload = decodeJwtPayload(req.accessToken);
        const tenantId = payload?.user_metadata?.tenant_id ??
            payload?.tenant_id;
        const sub = payload?.sub;
        if (!sub) {
            res.status(401).json({ error: "Invalid token: missing sub claim." });
            return;
        }
        if (tenantId) {
            const { data, error } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("tenant_id", tenantId)
                .order("created_at", { ascending: false });
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ data });
            return;
        }
    }
    const profiles = await listProfiles(client);
    res.json({ data: profiles });
};
export const getUserGroups = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const groups = await listUserGroups(client);
    res.json({ data: groups });
};
export const postUserGroup = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = userGroupCreateSchema.parse(req.body);
    const group = await createUserGroup(client, {
        ...payload,
        description: payload.description ?? null
    });
    res.status(201).json({ data: group });
};
export const patchUserGroup = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Grupo invalido." });
    const payload = groupUpdateSchema.parse(req.body);
    const group = await updateUserGroup(client, id, {
        description: payload.description ?? null
    });
    res.json({ data: group });
};
export const postUserGroupMember = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = groupMemberSchema.parse(req.body);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
        res.status(401).json({ error: userError?.message ?? "Unauthorized" });
        return;
    }
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();
    if (profileError || !profile?.tenant_id) {
        res.status(400).json({ error: "Tenant nao encontrado." });
        return;
    }
    if (profile.tenant_id !== payload.tenant_id) {
        res.status(403).json({ error: "Tenant invalido." });
        return;
    }
    const { data, error } = await supabaseAdmin
        .from("user_group_members")
        .insert(payload)
        .select("*")
        .single();
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(201).json({ data });
};
export const deleteUserGroupMember = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = groupMemberDeleteSchema.parse(req.body);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
        res.status(401).json({ error: userError?.message ?? "Unauthorized" });
        return;
    }
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();
    if (profileError || !profile?.tenant_id) {
        res.status(400).json({ error: "Tenant nao encontrado." });
        return;
    }
    const { error } = await supabaseAdmin
        .from("user_group_members")
        .delete()
        .eq("user_id", payload.user_id)
        .eq("group_id", payload.group_id)
        .eq("tenant_id", profile.tenant_id);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(204).send();
};
export const getUserGroupMembers = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    if (supabaseAdmin && req.accessToken) {
        const payload = decodeJwtPayload(req.accessToken);
        const tenantId = payload?.user_metadata?.tenant_id ??
            payload?.tenant_id;
        if (tenantId) {
            const { data, error } = await supabaseAdmin
                .from("user_group_members")
                .select("*")
                .eq("tenant_id", tenantId)
                .order("user_id", { ascending: true });
            if (error) {
                res.status(500).json({ error: error.message });
                return;
            }
            res.json({ data });
            return;
        }
    }
    const members = await listUserGroupMembers(client);
    res.json({ data: members });
};
