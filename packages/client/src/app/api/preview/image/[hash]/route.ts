import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/utils/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  if (!process.env.SUPABASE_KEY) {
    throw new Error('supabase key is not found');
  }
  const supabaseClient = createClient(supabaseUrl, process.env.SUPABASE_KEY);

  const { error } = await supabaseClient.storage
    .from('images')
    .remove([`preview/${params.hash}.png`]);

  if (error) {
    throw error;
  }

  return new Response('', { status: 200 });
}
