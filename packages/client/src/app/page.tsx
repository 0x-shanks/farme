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
          <Tldraw hideUi shapeUtils={customShapeUtils}>
            <Network session={session} />
          </Tldraw>
        </Box>
      </Box>
    </main>
  );
}

const Network = track(({ session }: { session: Session }) => {
  const editor = useEditor();
  const { address } = useAccount();

  const [users, setUsers] = useState<UserResponseItem[]>();
  const [isDetailReady, setIsDetailsReady] = useState<boolean>(false);
  const [isNetworkReady, setNetworkReady] = useState<boolean>(false);

  const detailW = 200;
  const detailH = 200;
  useEffect(() => {
    if (!session.user?.id) {
      return;
    }

    if (!address) {
      return;
    }

    if (!isDetailReady) {
      const center = editor.getViewportPageCenter();

      editor.createShape<IUserDetailShape>({
        type: "userDetail",
        props: {
          w: 200,
          h: 360,
          fid: parseInt(session.user?.id ?? "0"),
          pfp: session.user?.image ?? "",
          displayName: session.user?.displayName ?? "",
          bio: session.user?.bio ?? "",
          userName: session.user?.name ?? "",
          address: address,
        },
        x: center.x - detailW / 2,
        y: center.y - detailH / 2 - 90,
      });

      editor.updateInstanceState({ canMoveCamera: false });
      setIsDetailsReady(true);
    }

    // Get Network
    (async () => {
      const res = await httpClient.get<UsersResponse>(
        `/farcaster/${session?.user?.id}/network`,
      );
      console.log(res);

      setUsers(res.data.users);
    })();
  }, [session.user?.id, address]);

  useEffect(() => {
    if (users != undefined && users.length == 0) {
      return;
    }

    const w = 100;
    const h = 80;

    const center = editor.getViewportPageCenter();

    users?.forEach((user, i) => {
      const offset = i % 8;
      const level = Math.floor(i / 8) + 1;
      let xOffset: number = 0;
      switch (offset) {
        case 0:
        case 3:
        case 5:
          xOffset = 1;
          break;
        case 2:
        case 4:
        case 7:
          xOffset = -1;
          break;
      }

      let yOffset: number = 0;
      switch (offset) {
        case 0:
        case 1:
        case 2:
          yOffset = 1;
          break;
        case 5:
        case 6:
        case 7:
          yOffset = -1;
          break;
      }

      const xWeight = 100;
      const yWeight = 150;

      editor.createShape<IUserShape>({
        type: "user",
        props: {
          w: 100,
          h: 80,
          fid: user?.fid ?? 0,
          pfp: user?.pfp ?? "",
          displayName: user.displayName ?? "",
          bio: user?.bio ?? "",
          userName: user?.userName ?? "",
          address: user.address,
        },
        x:
          center.x -
          w / 2 +
          xOffset * xWeight * level +
          (xOffset * detailW) / 2,
        y:
          center.y -
          h / 2 +
          yOffset * yWeight * level +
          (yOffset * detailH) / 2 +
          detailH / 2 -
          120,
      });
    });

    editor.updateInstanceState({ canMoveCamera: true });

    setNetworkReady(true);
  }, [users]);

  return <></>;
});
