import { CreatePreviewMappingRequest } from '@/models/createPreviewMappingRequest';
import { previewPrefix } from '@/utils/kv/prefix';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const req = (await request.json()) as CreatePreviewMappingRequest;

  await kv.set(`${previewPrefix}${req.hash}`, req.fid.toString());
  return NextResponse.json('');
}
