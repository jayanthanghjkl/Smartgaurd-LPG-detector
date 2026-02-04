import { createClient } from '@supabase/supabase-js';

// These will be configured via the Settings page or environment variables
export const getSupabaseClient = (url?: string, key?: string) => {
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (e) {
    console.error("Supabase Init Error:", e);
    return null;
  }
};