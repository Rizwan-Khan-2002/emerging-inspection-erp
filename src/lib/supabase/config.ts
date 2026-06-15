/**
 * Central place to read Supabase config and decide whether real Supabase
 * is wired up. When env vars are absent the app falls back to DEMO MODE
 * (cookie session + mock data) so it is runnable out of the box.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
