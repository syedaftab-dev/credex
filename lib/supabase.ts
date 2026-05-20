import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client (client-side, read-only)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          not: () => chain,
          single: async () => ({ data: null, error: new Error('Supabase offline mock') })
        };
        return chain;
      }
    } as any;

// Admin client (server-side, bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : {
      from: () => {
        const chain: any = {
          insert: async () => ({ error: new Error('Supabase offline mock') }),
          update: () => chain,
          upsert: async () => ({ error: new Error('Supabase offline mock') }),
          eq: () => chain,
          not: () => chain,
          select: () => chain,
          single: async () => ({ data: null, error: new Error('Supabase offline mock') })
        };
        return chain;
      }
    } as any;

export const hasSupabaseKeys = !!(supabaseUrl && supabaseAnonKey);
export const hasSupabaseAdminKey = !!(supabaseUrl && supabaseServiceKey);
