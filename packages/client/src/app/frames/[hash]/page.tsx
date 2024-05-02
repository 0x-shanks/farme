import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { getFrameMetadata, isFrameRequest } from 'frog/next';
import { siteOrigin } from '@/app/constants';
import { RedirectHome } from '@/components/redirectHome';

export async function generateMetadata({
  params
}: {
  params: { hash: string };
}): Promise<Metadata> {
  const frameMetadata = await getFrameMetadata(
    `${siteOrigin}/api/farcaster/frames/${params.hash}`
  );
  return {
    other: frameMetadata
  };
}

export default function Page() {
  if (isFrameRequest(headers())) return null;
  return (
    <main>
      <RedirectHome />
    </main>
  );
}
