"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthSync() {
    const router = useRouter();

    useEffect(() => {
        // Sync session from hash/fragment to cookies
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[AuthSync] Event:", event);

            if (session) {
                // We have a session! Now we MUST ensure cookies are set before moving.
                // A hard refresh is the most reliable way to force the browser to send cookies to the middleware.
                if (window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token")) {
                    console.log("[AuthSync] Token detected. Synchronizing and redirecting...");
                    // Clean up the hash to avoid infinite loops
                    window.history.replaceState(null, "", window.location.pathname);

                    setTimeout(() => {
                        window.location.href = "/dashboard";
                    }, 500);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    return null;
}
