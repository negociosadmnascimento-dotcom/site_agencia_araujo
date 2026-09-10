import { createClient } from '@supabase/supabase-js';

// Project details from user request
export const SUPABASE_PROJECT_ID = 'zzoujggbomtcpobcyhyt';
export const SUPABASE_PROJECT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const getStoredAnonKey = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('saas_supabase_anon_key');
      if (stored && stored.trim().length > 20) {
        return stored.trim();
      }
    } catch (_) {}
  }
  return (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
};

export const setCustomSupabaseKey = (key) => {
  if (typeof window !== 'undefined') {
    try {
      if (key && key.trim().length > 20) {
        localStorage.setItem('saas_supabase_anon_key', key.trim());
      } else {
        localStorage.removeItem('saas_supabase_anon_key');
      }
    } catch (_) {}
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = getStoredAnonKey();

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
  const currentKey = getStoredAnonKey();
  const configured = Boolean(currentKey && currentKey.length > 20 && !currentKey.includes('your_anon_key'));
  return {
    projectId: SUPABASE_PROJECT_ID,
    url: supabaseUrl,
    anonKey: currentKey ? `${currentKey.slice(0, 10)}...${currentKey.slice(-6)}` : '',
    rawAnonKey: currentKey,
    isConfigured: configured,
    dashboardUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`,
    apiSettingsUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`,
  };
};

// Test connection function
export const testSupabaseConnection = async (keyToTest) => {
  const key = keyToTest || getStoredAnonKey();
  if (!key || key.length < 20) {
    return { ok: false, error: 'Chave não informada ou inválida.' };
  }
  try {
    const testClient = createClient(supabaseUrl, key);
    const { data, error } = await testClient.from('form_submissions').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { ok: true, warning: 'Chave autenticada com sucesso! Porém a tabela "form_submissions" ainda precisa ser executada no SQL Editor.' };
      }
      return { ok: false, error: error.message || 'Erro de autenticação com a chave informada.' };
    }
    return { ok: true, message: 'Conexão estabelecida com sucesso com o banco de dados do Supabase!' };
  } catch (err) {
    return { ok: false, error: err.message || 'Falha ao conectar ao Supabase.' };
  }
};
