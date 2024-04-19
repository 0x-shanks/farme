// export const revalidate = 1; // A whole day

import { UserResponse } from "@/models/userResponse";
import { farcasterHubClient } from "@/utils/farcaster/client";
import { UserDataType } from "@farcaster/hub-nodejs";
import { NextResponse } from "next/server";
import { cache } from "react";
import { Address, fromBytes } from "viem";

export const revalidate = 3600 * 24; // A whole day

export async function GET(
  request: Request,
  { params }: { params: { fid: number } },
) {
  const fid = params.fid;

  const getUser = cache(
    async () => await farcasterHubClient.getUserDataByFid({ fid }),
  );

  const getVerification = cache(
    async () => await farcasterHubClient.getVerificationsByFid({ fid }),
  );

  const user = await getUser();
  const verification = await getVerification();

  type UserRes = {
    fid?: number;
    pfp?: string;
    displayName?: string;
    bio?: string;
    userName?: string;
    address?: Address;
  };

  const u = user.unwrapOr(undefined);

  if (u == undefined) {
    throw new Error();
  }

  const data: UserRes = {};

  u.messages.forEach((m) => {
    if (data.fid == undefined) {
      data.fid = m.data?.fid;
    }
    if (data.address == undefined && m.data?.fid != undefined) {
      const v = verification.unwrapOr(undefined);
      if (v?.messages[0] != undefined) {
        const add = v.messages[0].data?.verificationAddAddressBody?.address;
        data.address = add != undefined ? fromBytes(add, "hex") : undefined;
      }
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

  const response: UserResponse = {
    user: data,
  };

  return NextResponse.json(response);
}
