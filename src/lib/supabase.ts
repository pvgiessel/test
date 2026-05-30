import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Of de Supabase-omgeving is ingesteld (env-variabelen aanwezig). */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * De Supabase-client. Null wanneer de env-variabelen ontbreken; de app toont
 * dan een configuratiescherm in plaats van te crashen.
 */
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
