import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/dashboard'

    console.log(`[Auth Callback] Received request with code: ${code ? 'YES' : 'NO'}, next: ${next}`);

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )

        console.log("[Auth Callback] Exchanging code for session...");
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log(`[Auth Callback] Success! Redirecting to ${origin}${next}`);
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error("[Auth Callback] Error exchanging code:", error.message);
    }

    // return the user to an error page with instructions
    console.log("[Auth Callback] No code or error occurred. Redirecting to login.");
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
