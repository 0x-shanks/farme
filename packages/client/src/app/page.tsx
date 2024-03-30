"use client";

import { Box, Button, Center, Spinner, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { StatusAPIResponse } from "@farcaster/auth-kit";
import { SignInButton } from "@farcaster/auth-kit";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { Network } from "@/components/Network";
import { UserResponse, UserResponseItem } from "@/models/userResponse";
import { httpClient } from "@/utils/http/client";

export default function Home() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { data: session, status: sessionStatus } = useSession();
  const { address } = useAccount();

  const [farcasterUser, setFarcasterUser] = useState<UserResponseItem>();
  const onceUserFetch = useRef<boolean>(false);

  useEffect(() => {
    if (onceUserFetch.current) {
      return;
    }
    if (session?.user?.id == undefined) {
      return;
    }
    (async () => {
      const res = await httpClient.get<UserResponse>(
        `/farcaster/${session?.user?.id}`,
      );
      setFarcasterUser(res.data.user);
    })();
  }, [session?.user?.id]);

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

  if (farcasterUser == undefined) {
    return (
      <main>
        <Center w="full" h="100dvh">
          <Spinner />
        </Center>
      </main>
    );
  }

  // TODO: be enabled
  // if (address?.toLowerCase() != farcasterUser.address?.toLowerCase()) {
  //   return (
  //     <main>
  //       <Center w="full" h="100dvh">
  //         <VStack>
  //           <Button onClick={() => logout()}>Disconnect wallet</Button>
  //           <Button onClick={() => signOut()}>Signout farcaster</Button>
  //         </VStack>
  //       </Center>
  //     </main>
  //   );
  // }

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
