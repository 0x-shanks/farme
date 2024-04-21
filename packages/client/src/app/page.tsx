'use client';

import {
  Box,
  Button,
  Center,
  Image,
  Spinner,
  VStack,
  Text
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { StatusAPIResponse } from '@farcaster/auth-kit';
import { SignInButton } from '@farcaster/auth-kit';
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react';
import { useAccount } from 'wagmi';
import { Network } from '@/components/Network';
import { UserResponse, UserResponseItem } from '@/models/userResponse';
import { httpClient } from '@/utils/http/client';
import { Address } from 'viem';

export default function Home() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { data: session, status: sessionStatus } = useSession();

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
        `/farcaster/${session?.user?.id}`
      );
      setFarcasterUser(res.data.user);
      onceUserFetch.current = true;
    })();
  }, [session?.user?.id]);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (nonce == undefined) throw new Error('Unable to generate nonce');
    return nonce;
  }, []);

  const handleSignInSuccess = useCallback(
    (res: StatusAPIResponse) => {
      console.log(res);
      signIn('credentials', {
        message: res.message,
        signature: res.signature,
        name: res.username,
        displayName: res.displayName,
        pfp: res.pfpUrl,
        nonce: res.nonce,
        bio: res.bio,
        redirect: false
      });
    },
    [signIn]
  );

  if (!ready || sessionStatus == 'loading') {
    return (
      <main>
        <Center w="full" h="100dvh" pos="fixed" top={0} left={0}>
          <Spinner />
        </Center>
      </main>
    );
  }

  if (!session) {
    return (
      <main>
        <VStack
          w="full"
          h="100dvh"
          pos="fixed"
          top={0}
          left={0}
          justify="center"
          backgroundImage="/images/sticker-bg.jpg"
          backgroundPosition="center"
          backgroundSize="cover"
        >
          <Box
            pos="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            bg="black"
            opacity={0.5}
            zIndex={-10}
          ></Box>
          <Image src="/images/logo-white.png" alt="farme" w="90%" maxW="md" />
          <SignInButton nonce={getNonce} onSuccess={handleSignInSuccess} />
        </VStack>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main>
        <VStack
          w="full"
          h="100dvh"
          pos="fixed"
          top={0}
          left={0}
          justify="center"
          backgroundImage="/images/sticker-bg.jpg"
          backgroundPosition="center"
          backgroundSize="cover"
          px={4}
          spacing={8}
        >
          <Box
            pos="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            bg="black"
            opacity={0.5}
            zIndex={-10}
          ></Box>
          <Text textAlign="center" color="white" fontWeight="bold">
            Is your address tied to your Farcaster account? Please login with
            your verified address 😎
          </Text>

          <Button onClick={login} colorScheme="primary" rounded="full">
            Connect Wallet
          </Button>
        </VStack>
      </main>
    );
  }

  if (farcasterUser == undefined) {
    return (
      <main>
        <Center w="full" h="100dvh" pos="fixed" top={0} left={0}>
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
              fid: parseInt(session.user?.id ?? '0'),
              pfp: session.user?.image ?? '',
              displayName: session.user?.displayName ?? '',
              bio: session.user?.bio,
              userName: session.user?.displayName,
              address: user?.wallet?.address as Address | undefined
            }}
            hasPrevious={false}
          />
        </Box>
      </Box>
    </main>
  );
}
