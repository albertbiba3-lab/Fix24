import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL || 'https://upjbcrdqaivgfsqmfmaf.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ewZ1Y6rh3jRg5HA_R3BPHw_uMhMLs7h';
export const supabase = createClient(url, key, {
  global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(15000) }) },
});
