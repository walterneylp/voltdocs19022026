import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyProfile } from "../models/company-profile.js";

export const listCompanyProfiles = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("company_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as CompanyProfile[];
};

export const createCompanyProfile = async (
  client: SupabaseClient,
  payload: Omit<CompanyProfile, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("company_profiles")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as CompanyProfile;
};

export const updateCompanyProfile = async (
  client: SupabaseClient,
  id: string,
  patch: Partial<Omit<CompanyProfile, "id" | "tenant_id" | "created_at">>
) => {
  const { data, error } = await client
    .from("company_profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as CompanyProfile;
};

export const deleteCompanyProfile = async (client: SupabaseClient, id: string) => {
  const { data, error } = await client
    .from("company_profiles")
    .delete()
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as CompanyProfile;
};
