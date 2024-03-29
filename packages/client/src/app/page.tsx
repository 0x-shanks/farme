"use client";

import { Box, Button, Center, Spinner } from "@chakra-ui/react";
import { useCallback } from "react";

import { usePrivy } from "@privy-io/react-auth";

import { StatusAPIResponse } from "@farcaster/auth-kit";
import { SignInButton } from "@farcaster/auth-kit";
import { getCsrfToken, signIn, useSession } from "next-auth/react";

export default function Home() {
  const { ready, authenticated, login, user } = usePrivy();
  const { data: session } = useSession();

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
      <Box w="full" h="100dvh"></Box>
    </main>
  );
}
