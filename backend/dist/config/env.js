import dotenv from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const currentDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(currentDir, "../../.env") });
const envSchema = z.object({
    PORT: z.string().default("4000"),
    SUPABASE_URL: z.string().min(1),
    SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional()
});
const fallbackSchema = z.object({
    PORT: z.string().default("4000"),
    VITE_SUPABASE_URL: z.string().min(1),
    VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().min(1).optional(),
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional()
});
const parsed = envSchema.safeParse(process.env);
let resolvedEnv;
if (parsed.success) {
    resolvedEnv = parsed.data;
}
else {
    const fallback = fallbackSchema.safeParse(process.env);
    if (!fallback.success) {
        console.error("Env inválido:", {
            ...parsed.error.flatten().fieldErrors,
            ...fallback.error.flatten().fieldErrors
        });
        process.exit(1);
    }
    resolvedEnv = {
        PORT: fallback.data.PORT,
        SUPABASE_URL: fallback.data.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: fallback.data.VITE_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: fallback.data.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_STORAGE_BUCKET: fallback.data.SUPABASE_STORAGE_BUCKET,
        S3_ENDPOINT: fallback.data.S3_ENDPOINT,
        S3_ACCESS_KEY: fallback.data.S3_ACCESS_KEY,
        S3_SECRET_KEY: fallback.data.S3_SECRET_KEY,
        S3_BUCKET: fallback.data.S3_BUCKET,
        S3_REGION: fallback.data.S3_REGION
    };
}
export const env = resolvedEnv;
