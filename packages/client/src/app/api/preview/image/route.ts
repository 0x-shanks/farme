import { NextRequest } from 'next/server';
import { keccak256 } from 'viem';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/utils/supabase/client';

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('supabase key is not found');
  }
  const supabaseClient = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const searchParams = request.nextUrl.searchParams;
  const old = searchParams.get('old');

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const hash = keccak256(new Uint8Array(await file.arrayBuffer()));
  const filePath = `preview/${hash.substring(0, 34)}.png`;

  const { error } = await supabaseClient.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  if (!!old) {
    await supabaseClient.storage.from('images').remove([`preview/${old}.png`]);
  }

  const { data } = supabaseClient.storage.from('images').getPublicUrl(filePath);

  const res = {
    url: data.publicUrl
  };

  return new Response(JSON.stringify(res), { status: 200 });
}
