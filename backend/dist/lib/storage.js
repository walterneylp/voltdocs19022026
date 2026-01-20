import { env } from "../config/env.js";
import { supabaseAdmin } from "./supabase.js";
export const uploadToSupabaseStorage = async (key, body, contentType) => {
    if (!supabaseAdmin) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
    }
    const bucket = env.SUPABASE_STORAGE_BUCKET ?? env.S3_BUCKET;
    if (!bucket) {
        throw new Error("Bucket do storage não configurado");
    }
    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(key, body, { contentType, upsert: false });
    if (error) {
        throw new Error(error.message);
    }
    return { bucket, key };
};
export const removeFromSupabaseStorage = async (key, bucketOverride) => {
    if (!supabaseAdmin) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
    }
    const bucket = bucketOverride ?? env.SUPABASE_STORAGE_BUCKET ?? env.S3_BUCKET;
    if (!bucket) {
        throw new Error("Bucket do storage não configurado");
    }
    const { error } = await supabaseAdmin.storage.from(bucket).remove([key]);
    if (error) {
        throw new Error(error.message);
    }
};
export const createSignedStorageUrl = async (key, expiresInSeconds, bucketOverride) => {
    if (!supabaseAdmin) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
    }
    const bucket = bucketOverride ?? env.SUPABASE_STORAGE_BUCKET ?? env.S3_BUCKET;
    if (!bucket) {
        throw new Error("Bucket do storage não configurado");
    }
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(key, expiresInSeconds);
    if (error || !data?.signedUrl) {
        throw new Error(error?.message ?? "Falha ao gerar URL assinada");
    }
    return data.signedUrl;
};
