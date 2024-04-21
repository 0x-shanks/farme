import { farcasterHubClient } from '@/utils/farcaster/client';
import {
  FarcasterNetwork,
  getAuthMetadata,
  ID_REGISTRY_ADDRESS,
  idRegistryABI,
  KEY_GATEWAY_ADDRESS,
  keyGatewayABI,
  makeCastAdd,
  Metadata,
  NobleEd25519Signer,
  ViemLocalEip712Signer
} from '@farcaster/hub-nodejs';
import { NextResponse } from 'next/server';
import { Hex, hexToBytes } from 'viem';
import { z } from 'zod';

const FID = 489899;
const FC_NETWORK = FarcasterNetwork.MAINNET;

const requestSchema = z.object({
  from: z.number(),
  to: z.number(),
  url: z.string().url()
});

export async function POST(request: Request) {
  if (!process.env.FARCASTER_EDDSA_ACCOUNT_KEY) {
    throw new Error('priv key is not found');
  }

  const body = await request.json();
  let parsedBody: {
    from: number;
    to: number;
    url: string;
  } = { from: -1, to: -1, url: '' };
  try {
    parsedBody = requestSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.log(err.issues);
      return NextResponse.json(JSON.stringify({ message: err.issues }), {
        status: 400
      });
    }
    throw err;
  }

  const privateKeyBytes = hexToBytes(
    process.env.FARCASTER_EDDSA_ACCOUNT_KEY as Hex
  );

  const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

  const dataOptions = {
    fid: FID,
    network: FC_NETWORK
  };

  const cast = await makeCastAdd(
    {
      text: 'from  to ',
      embeds: [{ url: parsedBody.url }],
      embedsDeprecated: [],
      mentions: [parsedBody.from, parsedBody.to],
      mentionsPositions: [5, 9]
    },
    dataOptions,
    ed25519Signer
  );
  if (cast.isOk()) {
    const res = await farcasterHubClient.submitMessage(cast.value);
    if (res.isErr()) {
      throw res.error;
    }
  } else {
    throw cast.error;
  }

  return NextResponse.json('');
}
