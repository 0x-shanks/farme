import { ZoraIPFSResponse } from '@/models/zoraIPFSResponse';
import { ipfsURL } from '@/utils/ipfs/client';
import axios from 'axios';

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await axios.post<ZoraIPFSResponse>(
    `${ipfsURL}/add?stream-channels=true&cid-version=1&progress=false`,
    formData
  );

  return new Response(JSON.stringify(response.data), { status: 200 });
}
