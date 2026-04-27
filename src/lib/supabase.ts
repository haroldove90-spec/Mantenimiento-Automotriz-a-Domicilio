import { createClient } from '@supabase/supabase-js';

// Normalización estricta de la URL para evitar errores de ruta inválida
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let supabaseUrl = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
