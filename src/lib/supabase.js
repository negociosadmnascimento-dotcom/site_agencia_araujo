import { createClient } from '@supabase/supabase-js';

// Project details from user request
export const SUPABASE_PROJECT_ID = 'zzoujggbomtcpobcyhyt';
export const SUPABASE_PROJECT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check whether key is set and not placeholder
export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('your_anon_key')
);

// Create safe client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const getSupabaseStatus = () => {
  return {
    projectId: SUPABASE_PROJECT_ID,
    url: supabaseUrl,
    isConfigured: isSupabaseConfigured,
    dashboardUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`,
  };
};
