import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
    })
    : null;
export const getUserClient = (accessToken) => {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY ?? "", {
        auth: { persistSession: false },
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
};
