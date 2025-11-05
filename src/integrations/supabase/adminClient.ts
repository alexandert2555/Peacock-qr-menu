import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Support both NEXT_PUBLIC_* (for Next.js/Vercel compatibility) and VITE_* (for Vite)
// Check both import.meta.env and process.env for maximum compatibility
const getEnvVar = (nextPublicName: string, viteName: string): string | undefined => {
  // Try NEXT_PUBLIC_ first (from process.env or import.meta.env)
  if (typeof process !== 'undefined' && process.env) {
    const nextPublic = process.env[nextPublicName];
    if (nextPublic) return nextPublic;
  }
  if ((import.meta as any).env?.[nextPublicName]) {
    return (import.meta as any).env[nextPublicName];
  }
  // Fallback to VITE_* (Vite standard)
  return import.meta.env[viteName];
};

const SUPABASE_URL = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_ equivalents)');
}

export const adminSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});


