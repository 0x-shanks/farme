"use client";

import {
  Avatar,
  Box,
  Button,
  Center,
  Spinner,
  VStack,
  Text,
  Card,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { usePrivy } from "@privy-io/react-auth";

import { StatusAPIResponse } from "@farcaster/auth-kit";
import { SignInButton } from "@farcaster/auth-kit";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { httpClient } from "@/utils/http/client";
import { UserResponseItem, UsersResponse } from "@/models/userResponse";
import runes from "runes";
import { IUserShape, UserShapeUtil } from "@/components/UserShapeUtil";
import { Tldraw, track, useEditor, Vec } from "tldraw";
import { Session } from "next-auth";
import {
  IUserDetailShape,
  UserDetailShapeUtil,
} from "@/components/UserDetailShapeUtil";
import { useAccount } from "wagmi";
import { Network } from "@/components/Network";

export default function Home() {
  const { ready, authenticated, login, user } = usePrivy();
  const { data: session, status: sessionStatus } = useSession();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (nonce == undefined) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignInSuccess = useCallback(
    (res: StatusAPIResponse) => {
      console.log(res);
      signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        displayName: res.displayName,
        pfp: res.pfpUrl,
        nonce: res.nonce,
        bio: res.bio,
        redirect: false,
      });
    },
    [signIn],
  );

  const customShapeUtils = [UserShapeUtil, UserDetailShapeUtil];
  const { address } = useAccount();

  if (!ready) {
    return (
      <main>
        <Center w="full" h="100dvh">
          <Spinner />
        </Center>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main>
        <Center w="full" h="100dvh">
          <Button onClick={login}>Connect Wallet</Button>
        </Center>
      </main>
    );
  }

  if (sessionStatus == "loading") {
    return (
      <main>
        <Center w="full" h="100dvh">
          <Spinner />
        </Center>
      </main>
    );
  }

  if (!session) {
    return (
      <main>
        <Center w="full" h="100dvh">
          <SignInButton nonce={getNonce} onSuccess={handleSignInSuccess} />
        </Center>
      </main>
    );
  }

  return (
    <main>
      <Box w="full" h="100dvh">
        <Box
          pos="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          overflow="hidden"
        >
          <Network
            user={{
              fid: parseInt(session.user?.id ?? "0"),
              pfp: session.user?.image ?? "",
              displayName: session.user?.displayName ?? "",
              bio: session.user?.bio,
              userName: session.user?.displayName,
              address,
            }}
            hasPrevious={false}
          />
        </Box>
      </Box>
    </main>
  );
}
