import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // Next.js caches fetch() by default; vendor/policy data must stay fresh.
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          cache: "no-store",
        }),
    },
  });
}

export const supabase = createSupabaseClient();
