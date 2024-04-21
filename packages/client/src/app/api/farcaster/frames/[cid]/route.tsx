/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog';
import { handle } from 'frog/next';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
import { getIPFSPreviewURL } from '@/utils/ipfs/utils';
import { kv } from '@vercel/kv';
import { previewPrefix } from '@/utils/kv/prefix';
import { siteOrigin } from '@/app/constants';

const app = new Frog({
  basePath: '/api/farcaster/frames/:cid',
  imageAspectRatio: '1:1'
});

app.frame('/', async (c) => {
  const split = c.initialPath.split('/');
  const cid = split[split.length - 1];

  const fid = await kv.get<string>(`${previewPrefix}${cid}`);

  const url = `${siteOrigin}/network/${fid}`;

  return c.res({
    image: getIPFSPreviewURL(cid),
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
