/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog';
import { handle } from 'frog/next';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { getIPFSPreviewURL } from '@/utils/ipfs/utils';
import { kv } from '@vercel/kv';
import { circlePrefix, previewPrefix } from '@/utils/kv/prefix';
import { siteOrigin } from '@/app/constants';
import { supabaseUrl } from '@/utils/supabase/client';

const app = new Frog({
  basePath: '/api/farcaster/frames/circle/:cid',
  imageAspectRatio: '1:1'
});

app.frame('/', async (c) => {
  const split = c.initialPath.split('/');
  const hash = split[split.length - 1];

  const fid = await kv.get<string>(`${circlePrefix}${hash}`);

  const url = `${siteOrigin}/network/${fid}`;
  const previewImage = `${supabaseUrl}/storage/v1/object/public/images/circle/${hash}.png`;

  return c.res({
    image: previewImage,
    intents: [
      <Button.Link href={url} key="button1">
        Check farme!
      </Button.Link>
    ]
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
