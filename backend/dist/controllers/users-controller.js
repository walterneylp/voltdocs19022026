import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
const userCreateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.string().min(1),
    tenant_id: z.string().uuid(),
    group_ids: z.array(z.string().uuid()).optional()
});
const userUpdateSchema = z.object({
    name: z.string().min(1),
    role: z.string().min(1)
});
const userBlockSchema = z.object({
    reason: z.string().min(3)
});
const userDeleteSchema = z.object({
    reason: z.string().min(3)
});
export const createUser = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const payload = userCreateSchema.parse(req.body);
    const createAuthUser = async () => supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
            name: payload.name,
            role: payload.role,
            tenant_id: payload.tenant_id
        }
    });
    let { data, error } = await createAuthUser();
    if (error?.message?.toLowerCase().includes("already been registered")) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });
        if (!listError && listData?.users?.length) {
            const existing = listData.users.find((user) => (user.email ?? "").toLowerCase() === payload.email.toLowerCase());
            if (existing?.user_metadata?.deleted) {
                const tombstoneEmail = `deleted+${existing.id}@deleted.local`;
                await supabaseAdmin.auth.admin.updateUserById(existing.id, {
                    email: tombstoneEmail
                });
                await supabaseAdmin
                    .from("profiles")
                    .update({ email: tombstoneEmail })
                    .eq("id", existing.id);
                data = null;
                error = null;
                ({ data, error } = await createAuthUser());
            }
        }
    }
    if (error || !data.user) {
        const message = error?.message ?? "User not created";
        if (message.toLowerCase().includes("already been registered")) {
            res.status(400).json({ error: "E-mail já cadastrado." });
            return;
        }
        res.status(400).json({ error: message });
        return;
    }
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        tenant_id: payload.tenant_id
    });
    if (profileError) {
        if (profileError.message.includes("profiles_tenant_email_idx")) {
            res.status(400).json({ error: "E-mail já cadastrado." });
            return;
        }
        res.status(400).json({ error: profileError.message });
        return;
    }
    if (payload.group_ids && payload.group_ids.length > 0) {
        const groupRows = payload.group_ids.map((groupId) => ({
            user_id: data.user.id,
            group_id: groupId,
            tenant_id: payload.tenant_id
        }));
        const { error: groupError } = await supabaseAdmin
            .from("user_group_members")
            .insert(groupRows);
        if (groupError) {
            res.status(400).json({ error: groupError.message });
            return;
        }
    }
    res.status(201).json({
        data: {
            id: data.user.id,
            email: data.user.email,
            name: payload.name,
            role: payload.role,
            tenant_id: payload.tenant_id
        }
    });
};
export const getUsers = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const client = req.supabase;
    if (!client) {
        res.status(500).json({ error: "Missing supabase client" });
        return;
    }
    const { data: userData, error } = await client.auth.getUser();
    if (error || !userData.user) {
        res.status(401).json({ error: error?.message ?? "Unauthorized" });
        return;
    }
    const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();
    if (profileError || !profile?.tenant_id) {
        res.status(400).json({ error: "Tenant nao encontrado." });
        return;
    }
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });
    if (listError || !data?.users) {
        res.status(400).json({ error: listError?.message ?? "Falha ao listar usuarios." });
        return;
    }
    const tenantId = profile.tenant_id;
    const users = data.users
        .filter((user) => user.user_metadata?.tenant_id === tenantId)
        .map((user) => ({
        id: user.id,
        email: user.user_metadata?.original_email ?? user.email,
        name: user.user_metadata?.name ?? null,
        role: user.user_metadata?.role ?? null,
        tenant_id: tenantId,
        blocked: Boolean(user.user_metadata?.blocked),
        deleted: Boolean(user.user_metadata?.deleted),
        blocked_reason: user.user_metadata?.blocked_reason ?? null,
        deleted_reason: user.user_metadata?.deleted_reason ?? null
    }));
    res.json({ data: users });
};
const getProfileOrFail = async (req, res, id) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return null;
    }
    const client = req.supabase;
    if (!client) {
        res.status(500).json({ error: "Missing supabase client" });
        return null;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
        res.status(401).json({ error: userError?.message ?? "Unauthorized" });
        return null;
    }
    const { data: requesterProfile, error: requesterError } = await supabaseAdmin
        .from("profiles")
        .select("tenant_id")
        .eq("id", userData.user.id)
        .single();
    if (requesterError || !requesterProfile?.tenant_id) {
        res.status(400).json({ error: "Tenant nao encontrado." });
        return null;
    }
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, name, role, email, tenant_id")
        .eq("id", id)
        .eq("tenant_id", requesterProfile.tenant_id)
        .single();
    if (error || !data) {
        res.status(404).json({ error: "Usuario nao encontrado." });
        return null;
    }
    return data;
};
const hasUserActivity = async (req, userId) => {
    const client = req.supabase;
    if (!client)
        return true;
    const { count: ticketCount } = await client
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .or(`opened_by_id.eq.${userId},assigned_to_id.eq.${userId}`);
    if ((ticketCount ?? 0) > 0)
        return true;
    const { count: updateCount } = await client
        .from("field_updates")
        .select("id", { count: "exact", head: true })
        .or(`user_id.eq.${userId},closed_by_id.eq.${userId}`);
    return (updateCount ?? 0) > 0;
};
export const updateUser = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ error: "Usuario invalido." });
        return;
    }
    const profile = await getProfileOrFail(req, res, id);
    if (!profile)
        return;
    const payload = userUpdateSchema.parse(req.body);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (userError || !userData.user) {
        res.status(400).json({ error: userError?.message ?? "Usuario nao encontrado." });
        return;
    }
    const mergedMeta = {
        ...(userData.user.user_metadata ?? {}),
        name: payload.name,
        role: payload.role
    };
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: mergedMeta
    });
    if (updateError) {
        res.status(400).json({ error: updateError.message });
        return;
    }
    const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ name: payload.name, role: payload.role })
        .eq("id", profile.id);
    if (profileError) {
        res.status(400).json({ error: profileError.message });
        return;
    }
    res.json({ data: { id, name: payload.name, role: payload.role } });
};
export const deleteUser = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ error: "Usuario invalido." });
        return;
    }
    const payload = userDeleteSchema.parse(req.body);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (userError || !userData.user) {
        res.status(400).json({ error: userError?.message ?? "Usuario nao encontrado." });
        return;
    }
    const originalEmail = userData.user.email ?? "";
    const tombstoneEmail = `deleted+${id}@deleted.local`;
    const mergedMeta = {
        ...(userData.user.user_metadata ?? {}),
        deleted: true,
        deleted_reason: payload.reason,
        deleted_at: new Date().toISOString(),
        original_email: originalEmail,
        blocked: true
    };
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: mergedMeta,
        email: tombstoneEmail,
        ban_duration: "87600h"
    });
    if (updateError) {
        res.status(400).json({ error: updateError.message });
        return;
    }
    if (originalEmail) {
        await supabaseAdmin
            .from("profiles")
            .update({ email: tombstoneEmail })
            .eq("id", id);
    }
    const tenantId = userData.user.user_metadata?.tenant_id ?? null;
    if (tenantId) {
        await supabaseAdmin
            .from("user_group_members")
            .delete()
            .eq("user_id", id)
            .eq("tenant_id", tenantId);
    }
    else {
        await supabaseAdmin.from("user_group_members").delete().eq("user_id", id);
    }
    res.status(200).json({ data: { id, deleted: true } });
};
export const blockUser = async (req, res) => {
    if (!supabaseAdmin) {
        res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
        return;
    }
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ error: "Usuario invalido." });
        return;
    }
    const profile = await getProfileOrFail(req, res, id);
    if (!profile)
        return;
    const payload = userBlockSchema.parse(req.body);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (userError || !userData.user) {
        res.status(400).json({ error: userError?.message ?? "Usuario nao encontrado." });
        return;
    }
    const mergedMeta = {
        ...(userData.user.user_metadata ?? {}),
        blocked: true,
        blocked_reason: payload.reason,
        blocked_at: new Date().toISOString()
    };
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: mergedMeta,
        ban_duration: "87600h"
    });
    if (updateError) {
        res.status(400).json({ error: updateError.message });
        return;
    }
    res.json({ data: { id, blocked: true } });
};
