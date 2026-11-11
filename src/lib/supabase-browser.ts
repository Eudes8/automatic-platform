"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client temps réel navigateur, créé uniquement si Supabase est configuré.
 * Sans variables d'environnement, la plateforme reste pleinement utilisable :
 * les composants se rabattent sur un rafraîchissement classique.
 */

let cached: SupabaseClient | null | undefined;

export function isRealtimeConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getRealtimeClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  if (!isRealtimeConfigured()) {
    cached = null;
    return cached;
  }

  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return cached;
}
