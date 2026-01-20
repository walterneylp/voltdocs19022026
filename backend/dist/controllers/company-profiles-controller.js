import { z } from "zod";
import { createCompanyProfile, deleteCompanyProfile, listCompanyProfiles } from "../repositories/company-profiles-repo.js";
import { updateCompanyProfile } from "../repositories/company-profiles-repo.js";
const companyProfileSchema = z.object({
    tenant_id: z.string().uuid(),
    legal_name: z.string().min(1),
    trade_name: z.string().nullable().optional(),
    cnpj: z.string().min(1),
    state_registration: z.string().nullable().optional(),
    municipal_registration: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    address_street: z.string().nullable().optional(),
    address_number: z.string().nullable().optional(),
    address_complement: z.string().nullable().optional(),
    address_district: z.string().nullable().optional(),
    address_city: z.string().nullable().optional(),
    address_state: z.string().nullable().optional(),
    address_zip: z.string().nullable().optional()
});
export const getCompanyProfiles = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const profiles = await listCompanyProfiles(client);
    res.json({ data: profiles });
};
export const postCompanyProfile = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = companyProfileSchema.parse(req.body);
    const profile = await createCompanyProfile(client, {
        ...payload,
        trade_name: payload.trade_name ?? null,
        state_registration: payload.state_registration ?? null,
        municipal_registration: payload.municipal_registration ?? null,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        website: payload.website ?? null,
        address_street: payload.address_street ?? null,
        address_number: payload.address_number ?? null,
        address_complement: payload.address_complement ?? null,
        address_district: payload.address_district ?? null,
        address_city: payload.address_city ?? null,
        address_state: payload.address_state ?? null,
        address_zip: payload.address_zip ?? null
    });
    res.status(201).json({ data: profile });
};
const companyProfileUpdateSchema = companyProfileSchema.partial().omit({ tenant_id: true });
export const patchCompanyProfile = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const profileId = z.string().uuid().parse(req.params.id);
    const patch = companyProfileUpdateSchema.parse(req.body);
    const profile = await updateCompanyProfile(client, profileId, patch);
    res.json({ data: profile });
};
export const removeCompanyProfile = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const profileId = z.string().uuid().parse(req.params.id);
    const profile = await deleteCompanyProfile(client, profileId);
    res.json({ data: profile });
};
