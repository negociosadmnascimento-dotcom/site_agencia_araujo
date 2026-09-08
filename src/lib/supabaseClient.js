/**
 * supabaseClient.js
 * Ponto de entrada padronizado para o cliente Supabase.
 * Re-exporta tudo que vem de supabase.js para facilitar imports
 * com o alias `supabaseClient` em vez de `supabase`.
 *
 * Usage:
 *   import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
 */

export { supabase, isSupabaseConfigured, SUPABASE_PROJECT_ID, SUPABASE_PROJECT_URL } from './supabase';
