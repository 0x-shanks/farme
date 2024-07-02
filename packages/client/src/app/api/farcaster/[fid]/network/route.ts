import { UsersResponse } from '@/models/userResponse';
import { farcasterHubClient } from '@/utils/farcaster/client';
import { neynarClient } from '@/utils/neynar/client';
import { CastAddBody, ReactionBody, UserDataType } from '@farcaster/hub-nodejs';
import { FollowSortType } from '@neynar/nodejs-sdk';
import { NextRequest, NextResponse } from 'next/server';

import { cache } from 'react';
import { Address, fromBytes } from 'viem';

export const revalidate = 3600 * 24; // A whole day
// export const revalidate = 1; // A whole day

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: number } }
) {
  const fid = params.fid;

  const searchParams = request.nextUrl.searchParams;
  const inits = searchParams.getAll('init');
  const canvasAppearanceWeight = 2;
  const followingWeight = 10;
  const followerWeight = 10;

  const getFollowers = cache(
    async () =>
      await neynarClient.fetchUserFollowersV2(fid, {
        sortType: FollowSortType.Algorithmic,
        limit: 100
      })
  );

  const followers = await getFollowers();

  const getFollowing = cache(
    async () =>
      await neynarClient.fetchUserFollowingV2(fid, {
        sortType: FollowSortType.Algorithmic,
        limit: 100
      })
  );

  const following = await getFollowing();

  const getReactions = cache(
    async () =>
      await farcasterHubClient.read.getReactionsByFid({
        fid,
        pageSize: 50,
        reverse: true
      })
  );

  const reactions = await getReactions();
  const reactionBodies: ReactionBody[] = [];
  reactions.match(
    (t) => {
      t.messages.forEach((m) => {
        if (m.data?.reactionBody != undefined) {
          reactionBodies.push(m.data?.reactionBody);
        }
      });
    },
    (e) => {
      throw e;
    }
  );

  const getCastsByMention = cache(
    async () =>
      await farcasterHubClient.read.getCastsByMention({
        fid: fid,
        pageSize: 20,
        reverse: true
      })
  );
  const castsByMention = await getCastsByMention();
  const castBodies: CastAddBody[] = [];
  castsByMention.match(
    (t) => {
      t.messages.forEach((m) => {
        if (m.data?.castAddBody != undefined) {
          castBodies.push(m.data?.castAddBody);
        }
      });
    },
    (e) => {
      throw e;
    }
  );

  const score = new Map<number, number>();

  inits.forEach((i) => {
    const fid = parseInt(i.split(':')[0]);
    const count = parseInt(i.split(':')[0]);
    if (!fid || !count) return;

    score.set(fid, count + canvasAppearanceWeight);
  });

  followers.users.forEach((u) => {
    //@ts-ignore
    const fid = u.user.fid;
    const s = score.get(fid);
    if (s == undefined) {
      score.set(fid, followerWeight);
    } else {
      score.set(fid, s + followerWeight);
    }
  });

  following.users.forEach((u) => {
    //@ts-ignore
    const fid = u.user.fid;
    const s = score.get(fid);
    if (s == undefined) {
      score.set(fid, followingWeight);
    } else {
      score.set(fid, s + followingWeight);
    }
  });

  reactionBodies.forEach((b) => {
    if (b.targetCastId?.fid != undefined) {
      const s = score.get(b.targetCastId.fid);
      if (s == undefined) {
        score.set(b.targetCastId.fid, b.type);
      } else {
        score.set(b.targetCastId.fid, s + b.type);
      }
    }
  });

  castBodies.forEach((b) => {
    if (b.parentCastId?.fid != undefined) {
      const s = score.get(b.parentCastId.fid);
      if (b.parentCastId.fid == fid) {
        return;
      }
      if (s == undefined) {
        score.set(b.parentCastId.fid, 1);
      } else {
        score.set(b.parentCastId.fid, s + 1);
      }
    }
  });

  let fids = Array.from(score.entries())
    .filter((v) => v[0] != fid)
    .sort((a, b) => b[1] - a[1])
    .map((v) => v[0]);

  fids = fids.slice(0, fids.length - 1 > 23 ? 23 : fids.length - 1);

  const users = await Promise.all(
    fids.map(
      cache(async (fid) => farcasterHubClient.read.getUserDataByFid({ fid }))
    )
  );

  const verifications = await Promise.all(
    fids.map(
      cache(async (fid) =>
        farcasterHubClient.read.getVerificationsByFid({ fid })
      )
    )
  );

  const addresses = new Map<number, Address | undefined>();
  verifications.forEach((verification) => {
    const v = verification.unwrapOr(undefined);
    if (v != undefined && v.messages[0] != undefined) {
      const body = v.messages[0].data?.verificationAddAddressBody;
      addresses.set(
        v.messages[0].data?.fid ?? 0,
        body?.address != undefined ? fromBytes(body.address, 'hex') : undefined
      );
    }
  });

  type UserRes = {
    fid?: number;
    pfp?: string;
    displayName?: string;
    bio?: string;
    userName?: string;
    address?: Address;
  };

  const userData: UserRes[] = [];
  users.forEach((user) => {
    const u = user.unwrapOr(undefined);

    if (u != undefined) {
      const data: UserRes = {};

      u.messages.forEach((m) => {
        if (addresses.get(m.data?.fid ?? 0) == undefined) {
          return;
        }

        if (data.fid == undefined) {
          data.fid = m.data?.fid;
        }
        if (data.address == undefined && m.data?.fid != undefined) {
          data.address = addresses.get(m.data?.fid);
        }
        const body = m.data?.userDataBody;
        if (body == undefined) {
          return;
        }
        switch (body.type) {
          case UserDataType.PFP:
            data.pfp = body.value;
            return;
          case UserDataType.DISPLAY:
            data.displayName = body.value;
            return;
          case UserDataType.BIO:
            data.bio = body.value;
            return;
          case UserDataType.USERNAME:
            data.userName = body.value;
            return;
        }
      });
      if (Object.keys(data).length != 0) {
        userData.push(data);
      }
    }
  });

  const response: UsersResponse = {
    users: userData
  };

  return NextResponse.json(response);
}
