import { appFid } from '@/app/constants';
import { FollowStatusResponse } from '@/models/followStatusResponse';
import { farcasterHubClient } from '@/utils/farcaster/client';
import { MessageType } from '@farcaster/hub-nodejs';
import { NextResponse } from 'next/server';
import { cache } from 'react';

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: { fid: number } }
) {
  const fid = params.fid;

  const getFollowStatus = cache(
    async () =>
      await farcasterHubClient.getLink({
        fid,
        targetFid: appFid,
        linkType: 'follow'
      })
  );

  const status = await getFollowStatus();

  const s = status.unwrapOr(undefined);

  let response: FollowStatusResponse = {
    follow: false
  };

  if (s == undefined) {
    return NextResponse.json(response);
  }

  response = {
    follow: s.data?.type == MessageType.LINK_ADD
  };

  return NextResponse.json(response);
}
