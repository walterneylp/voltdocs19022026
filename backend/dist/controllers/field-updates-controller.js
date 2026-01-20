import { z } from "zod";
import { uploadToSupabaseStorage } from "../lib/storage.js";
import { closeFieldUpdate, createFieldUpdate, listFieldUpdates } from "../repositories/field-updates-repo.js";
import { createSignedStorageUrl } from "../lib/storage.js";
const fieldUpdateCreateSchema = z.object({
    base_path: z.string().nullable().optional(),
    message: z.string().min(1),
    code: z.string().nullable().optional(),
    user_id: z.string().uuid(),
    user_name: z.string().nullable().optional(),
    tenant_id: z.string().uuid().nullable().optional(),
    attachments: z.array(z.string()).nullable().optional(),
    audio_path: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    event_report: z.boolean().optional(),
    close_note: z.string().nullable().optional(),
    closed_at: z.string().nullable().optional(),
    closed_by_id: z.string().uuid().nullable().optional(),
    closed_by_name: z.string().nullable().optional()
});
const fieldUpdateCloseSchema = z.object({
    status: z.string().min(1),
    close_note: z.string().nullable().optional(),
    closed_at: z.string().nullable().optional(),
    closed_by_id: z.string().uuid().nullable().optional(),
    closed_by_name: z.string().nullable().optional()
});
const fileUrlSchema = z.object({
    path: z.string().min(1)
});
const uploadSchema = z.object({
    tenant_id: z.string().uuid(),
    user_id: z.string().uuid()
});
export const getFieldUpdates = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const updates = await listFieldUpdates(client);
    res.json({ data: updates });
};
export const postFieldUpdate = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = fieldUpdateCreateSchema.parse(req.body);
    let inferredEventReport = payload.event_report ?? null;
    if (inferredEventReport === null && payload.base_path && payload.code) {
        const { data: assetData } = await client
            .from("assets")
            .select("tag")
            .eq("id", payload.base_path)
            .single();
        if (assetData?.tag && assetData.tag === payload.code) {
            inferredEventReport = true;
        }
    }
    const update = await createFieldUpdate(client, {
        ...payload,
        base_path: payload.base_path ?? null,
        code: payload.code ?? null,
        user_name: payload.user_name ?? null,
        tenant_id: payload.tenant_id ?? null,
        attachments: payload.attachments ?? null,
        audio_path: payload.audio_path ?? null,
        status: payload.status ?? null,
        event_report: inferredEventReport ?? false,
        close_note: payload.close_note ?? null,
        closed_at: payload.closed_at ?? null,
        closed_by_id: payload.closed_by_id ?? null,
        closed_by_name: payload.closed_by_name ?? null
    });
    res.status(201).json({ data: update });
};
export const patchFieldUpdate = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const updateId = z.string().uuid().parse(req.params.id);
    const patch = fieldUpdateCloseSchema.parse(req.body);
    const update = await closeFieldUpdate(client, updateId, {
        status: patch.status,
        close_note: patch.close_note ?? null,
        closed_at: patch.closed_at ?? null,
        closed_by_id: patch.closed_by_id ?? null,
        closed_by_name: patch.closed_by_name ?? null
    });
    res.json({ data: update });
};
export const getFieldUpdateFileUrl = async (req, res) => {
    const { path } = fileUrlSchema.parse(req.body);
    if (path.startsWith("http://") || path.startsWith("https://")) {
        res.json({ data: { url: path } });
        return;
    }
    const parts = path.split("/");
    const bucket = parts.length > 1 ? parts[0] : undefined;
    const key = parts.length > 1 ? parts.slice(1).join("/") : path;
    const signedUrl = await createSignedStorageUrl(key, 600, bucket);
    res.json({ data: { url: signedUrl } });
};
export const uploadFieldUpdateFiles = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const files = req.files ?? [];
    if (files.length === 0) {
        res.status(400).json({ error: "Nenhum arquivo enviado." });
        return;
    }
    const payload = uploadSchema.parse(req.body);
    const timestamp = Date.now();
    const storedPaths = [];
    for (const file of files) {
        const safeName = file.originalname
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^A-Za-z0-9._-]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "") || "arquivo";
        const key = `field-updates/${payload.tenant_id}/${payload.user_id}/${timestamp}_${safeName}`;
        const stored = await uploadToSupabaseStorage(key, file.buffer, file.mimetype);
        storedPaths.push(`${stored.bucket}/${stored.key}`);
    }
    res.status(201).json({ data: storedPaths });
};
