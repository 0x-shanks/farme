import axios from 'axios';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  if (!url) {
    return new Response(JSON.stringify({ message: 'url is required' }), {
      status: 400
    });
  }

  const res = await fetch(url);

  return res;
}
