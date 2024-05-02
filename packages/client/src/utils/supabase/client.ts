import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ?? 'https://zzwsenfwtlisfcwavvno.supabase.co';

export const supabaseClient = createClient(
  supabaseUrl,
  process.env.SUPABASE_KEY ?? 'test'
);

export const supabaseDomain = supabaseUrl.split('/')[1];
