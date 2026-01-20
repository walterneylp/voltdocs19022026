import { z } from "zod";
import { createDocumentCategory, countDocumentsByCategory, deleteDocumentCategory, getDocumentCategory, listDocumentCategories, updateDocumentCategory } from "../repositories/document-categories-repo.js";
const categoryCreateSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    tenant_id: z.string().uuid()
});
const categoryUpdateSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1)
});
export const getDocumentCategories = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const categories = await listDocumentCategories(client);
    res.json({ data: categories });
};
export const postDocumentCategory = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = categoryCreateSchema.parse(req.body);
    const category = await createDocumentCategory(client, payload);
    res.status(201).json({ data: category });
};
export const patchDocumentCategory = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Categoria invalida." });
    const payload = categoryUpdateSchema.parse(req.body);
    const category = await getDocumentCategory(client, id);
    const usedCount = await countDocumentsByCategory(client, category.tenant_id, [
        category.name,
        category.code
    ]);
    if (usedCount > 0) {
        return res.status(409).json({ error: "Categoria em uso." });
    }
    const updated = await updateDocumentCategory(client, id, {
        code: payload.code,
        name: payload.name
    });
    res.json({ data: updated });
};
export const deleteDocumentCategoryById = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Categoria invalida." });
    const category = await getDocumentCategory(client, id);
    const usedCount = await countDocumentsByCategory(client, category.tenant_id, [
        category.name,
        category.code
    ]);
    if (usedCount > 0) {
        return res.status(409).json({ error: "Categoria em uso." });
    }
    await deleteDocumentCategory(client, id);
    res.status(204).send();
};
