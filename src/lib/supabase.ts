import { createBrowserClient } from '@supabase/ssr'

// Standard SSR Browser Client
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
