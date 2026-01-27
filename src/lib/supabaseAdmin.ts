import { createClient } from '@supabase/supabase-js';

// ADMIN CLIENT (bypass RLS and handle user creation)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey
);
