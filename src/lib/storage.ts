
import { createClient } from "@supabase/supabase-js";

// Use Service Role Key for backend storage operations to bypass RLS if needed, or normal client if RLS is set up.
// Generally for Admin upload, Service Role is safer/easier.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function uploadFileToStorage(
    bucket: string,
    path: string,
    fileBody: ArrayBuffer | Buffer,
    contentType: string
) {
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
    const { error } = await supabaseAdmin
        .storage
        .from(bucket)
        .remove([path]);

    if (error) throw error;
}
