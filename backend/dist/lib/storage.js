import { env } from "../config/env.js";
import { supabaseAdmin } from "./supabase.js";
export const resolveStoragePath = (filePath) => {
    const configuredBucket = env.SUPABASE_STORAGE_BUCKET ?? env.S3_BUCKET;
    const parts = filePath.split("/");
    if (parts.length > 1) {
        const first = parts[0];
        if (configuredBucket && first === configuredBucket) {
            return { bucket: first, key: parts.slice(1).join("/") };
        }
    }
    return { bucket: configuredBucket, key: filePath };
};
export const resolveStoragePathCandidates = (filePath) => {
    const configuredBucket = env.SUPABASE_STORAGE_BUCKET ?? env.S3_BUCKET;
    const parts = filePath.split("/");
    const candidates = [];
    if (parts.length > 1) {
        const first = parts[0];
        const rest = parts.slice(1).join("/");
        candidates.push({ bucket: first, key: rest });
    }
    if (configuredBucket) {
        candidates.push({ bucket: configuredBucket, key: filePath });
    }
    else {
        candidates.push({ bucket: undefined, key: filePath });
    }
    if (parts.length > 1 && configuredBucket && parts[0] === configuredBucket) {
        candidates.push({ bucket: configuredBucket, key: parts.slice(1).join("/") });
    }
    const unique = new Map();
    candidates.forEach((candidate) => {
        const sig = `${candidate.bucket ?? ""}|${candidate.key}`;
        if (!unique.has(sig))
            unique.set(sig, candidate);
    });
    return Array.from(unique.values());
};
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
    if (data.signedUrl.startsWith("http://") || data.signedUrl.startsWith("https://")) {
        return data.signedUrl;
    }
    const base = env.SUPABASE_URL.replace(/\/+$/, "");
    const rawPath = data.signedUrl.startsWith("/") ? data.signedUrl : `/${data.signedUrl}`;
    let signedPath = rawPath;
    if (!signedPath.startsWith("/storage/v1/")) {
        if (signedPath.startsWith("/object/")) {
            signedPath = `/storage/v1${signedPath}`;
        }
        else {
            signedPath = `/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;
        }
    }
    return `${base}${signedPath}`;
};
