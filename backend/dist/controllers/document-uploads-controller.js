import { z } from "zod";
import { uploadToSupabaseStorage } from "../lib/storage.js";
import { addDocumentVersion } from "../repositories/documents-repo.js";
const uploadSchema = z.object({
    document_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    version: z.string().min(1),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional()
});
export const uploadDocumentFile = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const file = req.file;
    if (!file) {
        res.status(400).json({ error: "Arquivo obrigatório." });
        return;
    }
    const payload = uploadSchema.parse(req.body);
    const timestamp = Date.now();
    const safeName = file.originalname
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^A-Za-z0-9._-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "") || "arquivo";
    const key = `documents/${payload.tenant_id}/${payload.document_id}/${timestamp}_${safeName}`;
    const stored = await uploadToSupabaseStorage(key, file.buffer, file.mimetype);
    const version = await addDocumentVersion(client, {
        document_id: payload.document_id,
        version: payload.version,
        file_path: `${stored.bucket}/${stored.key}`,
        file_name: file.originalname,
        valid_from: payload.valid_from ?? null,
        valid_until: payload.valid_until ?? null,
        tenant_id: payload.tenant_id
    });
    res.status(201).json({ data: version });
};
