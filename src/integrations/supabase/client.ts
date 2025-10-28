import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // yahan se aapko turant readable error mil jayega
  throw new Error(
    `Missing Supabase envs. Got URL=${String(url)} ANON=${
      anon ? "present" : "missing"
    }.
    Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.`
  );
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
