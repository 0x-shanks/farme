import { supabaseClient } from '@/utils/supabase/client';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const { error } = await supabaseClient.storage
    .from('images')
    .remove([`preview/${params.hash}.png`]);

  if (error) {
    throw error;
  }

  return new Response('', { status: 200 });
}
