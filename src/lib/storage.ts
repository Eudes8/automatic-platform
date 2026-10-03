
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Use Service Role Key for backend storage operations to bypass RLS if needed, or normal client if RLS is set up.
// Generally for Admin upload, Service Role is safer/easier.

// Instanciation paresseuse : le client n'est créé qu'au premier appel,
// pas à l'évaluation du module. Sinon `next build` échoue au stade
// « Collecting page data » quand les variables Supabase ne sont pas définies.
let instance: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
    if (!instance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error(
                "Configuration Supabase manquante : renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (voir .env.example)."
            );
        }

        instance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return instance;
}

export async function uploadFileToStorage(
    bucket: string,
    path: string,
    fileBody: ArrayBuffer | Buffer,
    contentType: string
) {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
        .storage
        .from(bucket)
        .upload(path, fileBody, {
            contentType,
            upsert: true
        });

    if (error) {
        console.error("Storage upload failed:", error);
        throw error;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from(bucket)
        .getPublicUrl(path);

    return publicUrl;
}

export async function deleteFileFromStorage(bucket: string, path: string) {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
        .storage
        .from(bucket)
        .remove([path]);

    if (error) throw error;
}
