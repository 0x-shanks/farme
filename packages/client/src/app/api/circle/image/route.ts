import { NextRequest } from 'next/server';
import { keccak256 } from 'viem';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/utils/supabase/client';
import { kv } from '@vercel/kv';
import { circlePrefix } from '@/utils/kv/prefix';

export async function POST(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('supabase key is not found');
  }
  const supabaseClient = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const searchParams = request.nextUrl.searchParams;
  const fid = searchParams.get('fid');
  if (!fid) {
    return new Response(JSON.stringify({ message: 'fid is required' }), {
      status: 400
    });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const hash = keccak256(new Uint8Array(await file.arrayBuffer()));
  const filePath = `circle/${hash.substring(0, 34)}.png`;

  const { error: upsertError } = await supabaseClient.storage
    .from('images')
    .upload(filePath, file, {
      upsert: true
    });

  if (upsertError) {
    throw upsertError;
  }

  const { data } = supabaseClient.storage.from('images').getPublicUrl(filePath);

  const res = {
    url: data.publicUrl
  };

  const oldHash = await kv.get<string>(`${circlePrefix}${fid}`);
  if (!!oldHash) {
    const { error } = await supabaseClient.storage
      .from('images')
      .remove([`circle/${oldHash}.png`]);

    if (error) {
      throw error;
    }
    await kv.del(`${circlePrefix}${fid}`);
  }

  return new Response(JSON.stringify(res), { status: 200 });
}
