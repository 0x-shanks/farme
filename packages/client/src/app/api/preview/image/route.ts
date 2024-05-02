import { supabaseClient } from '@/utils/supabase/client';
import { NextRequest } from 'next/server';
import { keccak256 } from 'viem';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const old = searchParams.get('old');

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const hash = keccak256(new Uint8Array(await file.arrayBuffer()));
  const filePath = `preview/${hash}.png`;

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
