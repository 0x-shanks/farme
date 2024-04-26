'use client';

import {
  Box,
  Button,
  Center,
  Image,
  Spinner,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  HStack
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { StatusAPIResponse } from '@farcaster/auth-kit';
import { SignInButton } from '@farcaster/auth-kit';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { Network } from '@/components/Network';
import { UserResponse, UserResponseItem } from '@/models/userResponse';
import { httpClient } from '@/utils/http/client';
import { Address } from 'viem';
import { FollowStatusResponse } from '@/models/followStatusResponse';
import { useLocalStorage } from 'usehooks-ts';
import { isMainnet } from './constants';
import { addDays, differenceInHours } from 'date-fns';
import { Player } from '@lottiefiles/react-lottie-player';
import Link from 'next/link';

export default function Home() {
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { data: session, status: sessionStatus } = useSession();

  const [farcasterUser, setFarcasterUser] = useState<UserResponseItem>();
  const [isFollowed, setIsFollowed] = useState<boolean>();
  const [extendedShowFollowModalDate, setExtendedShowFollowModalDate] =
    useLocalStorage<Date>('extendedShowFollowModalDate', new Date());
  const onceFetch = useRef<boolean>(false);

  const {
    isOpen: isFollowOpen,
    onOpen: onFollowOpen,
    onClose: onFollowClose
  } = useDisclosure();

  //
  // Side effect
  //

  useEffect(() => {
    if (onceFetch.current) {
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

      if (differenceInHours(extendedShowFollowModalDate, new Date()) < 1) {
        const follow = await httpClient.get<FollowStatusResponse>(
          `farcaster/${session?.user?.id}/follow`
        );
        setIsFollowed(follow.data.follow);
      }

      onceFetch.current = true;
    })();
  }, [session?.user?.id]);

  useEffect(() => {
    if (
      isFollowed == false &&
      differenceInHours(extendedShowFollowModalDate, new Date()) < 1
    ) {
      onFollowOpen();
    }
  }, [isFollowed]);

  //
  // Handler
  //

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

  const handleFollowClose = () => {
    setExtendedShowFollowModalDate(addDays(new Date(), 15));
    onFollowClose();
  };

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

  if (
    isMainnet &&
    user?.wallet?.address.toLowerCase() != farcasterUser.address?.toLowerCase()
  ) {
    return (
      <main>
        <Center
          w="full"
          h="100dvh"
          pos="fixed"
          top={0}
          left={0}
          backgroundImage="/images/sticker-bg.jpg"
          backgroundPosition="center"
          backgroundSize="cover"
          px={4}
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
          <VStack>
            <Text textAlign="center" color="white" fontWeight="bold">
              The connected wallet is not verified in the forecaster account.
              Please connect another wallet 😅
            </Text>
            <Button onClick={() => logout()} rounded="full">
              Disconnect wallet
            </Button>
          </VStack>
        </Center>
      </main>
    );
  }

  return (
    <main>
      <Box w="full" h="100dvh" pos="fixed" top={0} left={0}>
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

      <Modal isOpen={isFollowOpen} onClose={handleFollowClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enable Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="80%" mx="auto">
              <Player
                autoplay
                loop
                src="lotties/notification.json"
                style={{ height: '100%', width: '100%' }}
              />
            </Box>
            <Text>
              To enable notifications when you get stickers from other people,
              etc., please follow the farme account on farcaster!
            </Text>
          </ModalBody>

          <ModalFooter>
            <HStack justify="center" w="full">
              <Link
                href="https://warpcast.com/farme-club"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button colorScheme="primary" rounded="full">
                  Follow @farme-club
                </Button>
              </Link>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
