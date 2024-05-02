export const supabaseUrl =
  process.env.SUPABASE_URL ?? 'https://zzwsenfwtlisfcwavvno.supabase.co';

export const supabaseDomain = supabaseUrl.split('/')[1];
