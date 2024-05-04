import { CreatePreviewMappingRequest } from '@/models/createPreviewMappingRequest';
import { circlePrefix } from '@/utils/kv/prefix';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const req = (await request.json()) as CreatePreviewMappingRequest;

  await kv.set(`${circlePrefix}${req.hash}`, req.fid.toString());
  // await kv.set(`${circlePrefix}${req.fid.toString()}`, req.hash);
  return NextResponse.json('');
}
