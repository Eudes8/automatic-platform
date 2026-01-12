"use server";

import { createClient } from "@supabase/supabase-js";

export async function setAdminPassword(password: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase credentials for admin operation.");
        return { success: false, error: "Missing Server Credentials" };
    }

    // Direct Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    const email = "automaticbmje@gmail.com";

    console.log(`[Admin] Attempting to set password for ${email}...`);

    // 1. Check if user exists in Supabase Auth via Admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Failed to list users:", error);
        return { success: false, error: error.message };
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`[Admin] User found (${user.id}). Updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: password, email_confirm: true }
        );
        if (updateError) {
            console.error("Failed to update admin password:", updateError);
            return { success: false, error: updateError.message };
        }
        console.log("Admin password updated successfully.");
        return { success: true };
    } else {
        console.log(`[Admin] User not found. Creating new admin user...`);
        const { error: createError, data } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name: "Super Admin" }
        });

        if (createError) {
            console.error("Failed to create admin auth user:", createError);
            return { success: false, error: createError.message };
        }
        console.log(`Admin auth user created successfully (${data.user.id}).`);
        return { success: true };
    }
}
