"use server";

import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser || !authUser.email) return null;

        const user = await prisma.user.findUnique({
            where: { email: authUser.email },
        });

        return user;
    } catch (error) {
        console.error("[Action Error] getCurrentUser:", error);
        return null;
    }
}
