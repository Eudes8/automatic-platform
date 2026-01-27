
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const email = "automaticbmje@gmail.com";

    // Update or Create the user in Prisma with ADMIN role
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: "ADMIN" },
        create: {
            email,
            name: "Super Admin",
            role: "ADMIN"
        }
    });

    // Also update Supabase user metadata
    try {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const supabaseUser = users.users.find(u => u.email === email);

        if (supabaseUser) {
            await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
                app_metadata: {
                    role: 'ADMIN'
                }
            });
        }
    } catch (error) {
        console.error('Error updating Supabase metadata:', error);
    }

    return NextResponse.json({ success: true, user });
}
