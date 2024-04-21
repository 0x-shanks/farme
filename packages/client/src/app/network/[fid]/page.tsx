'use client';

import { UserResponse, UserResponseItem } from '@/models/userResponse';
import { httpClient } from '@/utils/http/client';
import { Box, Center, Spinner } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Network } from '@/components/Network';

export default function Home({ params }: { params: { fid: number } }) {
  const [user, setUser] = useState<UserResponseItem>();
  const onceUserFetch = useRef<boolean>(false);

  useEffect(() => {
    if (onceUserFetch.current) {
      return;
    }
    (async () => {
      const res = await httpClient.get<UserResponse>(
        `/farcaster/${params.fid}`
      );
      setUser(res.data.user);
    })();
  }, [params.fid]);

  if (user == undefined) {
    return (
      <main>
        <Center w="full" h="100dvh" pos="fixed" top={0} left={0}>
          <Spinner />
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
          <Network user={user} hasPrevious={true} />
        </Box>
      </Box>
    </main>
  );
}
