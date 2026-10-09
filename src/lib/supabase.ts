import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// `NEXT_PUBLIC_` vars are inlined at build time, so they must be read with
// their full literal names (no dynamic lookups).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Supabase now issues "publishable" keys; older projects use the "anon" key.
// Either works for Realtime.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Lazily creates the browser client. Returns `null` when env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 12 } },
    });
  }
  return client;
}
