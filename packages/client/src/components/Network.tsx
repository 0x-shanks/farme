'use client';

import { UserResponseItem, UsersResponse } from '@/models/userResponse';
import { FC, useEffect, useRef, useState } from 'react';
import { IUserShape, UserShapeUtil } from '@/components/UserShapeUtil';
import {
  IUserDetailShape,
  UserDetailShapeUtil
} from '@/components/UserDetailShapeUtil';
import { Tldraw, TLShapeId, track, useEditor } from 'tldraw';
import { httpClient } from '@/utils/http/client';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Icon,
  IconButton,
  useDisclosure,
  VStack,
  Text,
  Switch,
  DrawerHeader,
  Image
} from '@chakra-ui/react';
import { IoIosArrowBack } from 'react-icons/io';
import { canvasAbi } from '@/utils/contract/generated';
import { canvasAddress } from '@/utils/contract/address';
import { useReadContract } from 'wagmi';
import { MobileTool } from './MobileTool';
import { CiSettings } from 'react-icons/ci';
import { usePrivy } from '@privy-io/react-auth';
import { FiHome } from 'react-icons/fi';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import { signOut } from 'next-auth/react';
import { useLocalStorage } from 'usehooks-ts';

export const Network: FC<{
  user: UserResponseItem;
  hasPrevious: boolean;
}> = ({ user, hasPrevious }) => {
  const customShapeUtils = [UserShapeUtil, UserDetailShapeUtil];
  const customTools = [MobileTool];

  return (
    <Tldraw hideUi shapeUtils={customShapeUtils} tools={customTools}>
      <Content user={user} hasPrevious={hasPrevious} />
    </Tldraw>
  );
};

const Content = track(
  ({ user, hasPrevious }: { user: UserResponseItem; hasPrevious: boolean }) => {
    const editor = useEditor();
    const pathname = usePathname();

    editor.setCurrentTool('mobile');

    const [isDetailReady, setIsDetailsReady] = useState<boolean>(false);
    const [isNetworkReady, setNetworkReady] = useState<boolean>(false);
    const onceFetch = useRef<boolean>(false);
    const router = useRouter();
    const { logout } = usePrivy();

    const { data: canvasData, isSuccess: isCanvasSuccess } = useReadContract({
      abi: canvasAbi,
      address: canvasAddress,
      functionName: 'getCanvas',
      args: [user.address!],
      query: {
        enabled: user.address != undefined
      }
    });

    const detailW = 200;
    const detailH = 360;

    useEffect(() => {
      if (!user?.fid) {
        return;
      }

      if (!user.address) {
        return;
      }

      if (!isCanvasSuccess) {
        return;
      }

      if (onceFetch.current) {
        return;
      }

      const center = editor.getViewportPageCenter();

      editor.createShape<IUserDetailShape>({
        type: 'userDetail',
        props: {
          w: detailW,
          h: detailH,
          fid: user?.fid ?? '0',
          pfp: user?.pfp ?? '',
          displayName: user?.displayName ?? '',
          bio: user?.bio ?? '',
          userName: user?.userName ?? '',
          address: user.address,
          onClick: () => {
            router.push(`/canvas/${user.fid}/${user.address}`);
          },
          preview: canvasData?.[2]
        },
        x: center.x - detailW / 2,
        y: center.y - detailH / 2
      });

      setIsDetailsReady(true);
      onceFetch.current = true;

      for (let i: number = 0; i < 24; i++) {
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

        const w = 100;
        const h = 100;
        const xWeight = 100;
        const yWeight = 120;

        editor.createShape<IUserShape>({
          id: `shape:${i}` as TLShapeId,
          type: 'user',
          props: {
            w,
            h,
            fid: undefined,
            pfp: undefined,
            displayName: undefined,
            bio: undefined,
            userName: undefined,
            address: undefined,
            onClick: () => {}
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
            (yOffset * detailH) / 2
        });
      }

      // Get Network
      (async () => {
        const res = await httpClient.get<UsersResponse>(
          `/farcaster/${user?.fid}/network`
        );

        const users = res.data.users;

        editor.updateShapes(
          users?.map((user, i) => ({
            id: `shape:${i}` as TLShapeId,
            type: 'user',
            props: {
              fid: user?.fid ?? 0,
              pfp: user?.pfp ?? '',
              displayName: user.displayName ?? '',
              bio: user?.bio ?? '',
              userName: user?.userName ?? '',
              address: user.address,
              onClick: () => {
                router.push(`/network/${user.fid}`);
              }
            }
          }))
        );

        for (let i: number = users.length; i < 24; i++) {
          editor.deleteShape(`shape:${i}` as TLShapeId);
        }

        setNetworkReady(true);
      })();
    }, [user?.fid, user.address, isCanvasSuccess]);

    const handleBack = () => {
      router.back();
    };

    const handleBackHome = () => {
      router.push('/');
    };

    const {
      isOpen: isSettingOpen,
      onOpen: onSettingOpen,
      onClose: onSettingClose
    } = useDisclosure();

    const [enabledNotification, setEnabledNotification] =
      useLocalStorage<boolean>('notification', true);

    const handleLogout = async () => {
      await logout();
      await signOut({ redirect: false });
      router.push('/');
    };

    return (
      <>
        <Box
          pos="absolute"
          zIndex={300}
          inset={0}
          pointerEvents="none"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <Box
            pointerEvents="all"
            pos="absolute"
            top={0}
            right={0}
            px={6}
            py={4}
          >
            <IconButton
              aria-label=""
              colorScheme="gray"
              shadow="xl"
              size="lg"
              icon={<Icon as={CiSettings} />}
              onClick={onSettingOpen}
            />
          </Box>

          <HStack
            pos="absolute"
            bottom={8}
            left={0}
            right={0}
            px={6}
            py={4}
            justify="center"
          >
            {/* TODO: fix */}
            {pathname != '/' && (
              <IconButton
                aria-label="home"
                colorScheme="primary"
                icon={<Icon as={FiHome} />}
                onClick={handleBackHome}
                pointerEvents="all"
              />
            )}

            {hasPrevious && (
              <Button
                colorScheme="primary"
                leftIcon={<Icon as={IoIosArrowBack} />}
                onClick={handleBack}
                pointerEvents="all"
              >
                Back
              </Button>
            )}
          </HStack>
        </Box>

        <Drawer
          placement="bottom"
          onClose={onSettingClose}
          isOpen={isSettingOpen}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Settings</DrawerHeader>
            <DrawerBody w="full" pb={20}>
              <VStack w="full" spacing={6}>
                <VStack w="full">
                  <HStack w="full" justify="space-between">
                    <Text>Account</Text>
                    <Button colorScheme="red" size="sm" onClick={handleLogout}>
                      Logout
                    </Button>
                  </HStack>

                  <Divider />
                </VStack>

                <VStack w="full">
                  <HStack w="full" justify="space-between">
                    <Text>Notification</Text>
                    <Switch
                      colorScheme="primary"
                      isChecked={enabledNotification}
                      onChange={(e) => setEnabledNotification(e.target.checked)}
                    />
                  </HStack>

                  <Text w="full" textAlign="start" fontSize="sm" color="gray">
                    If disabled, notifications from you to the other party on
                    the farcaster will be stopped.
                  </Text>
                  <Divider />
                </VStack>

                <VStack w="full">
                  <HStack w="full" justify="space-between">
                    <Text>Privacy and terms</Text>
                  </HStack>

                  <Box w="full">
                    {/* TODO: fix href */}
                    <Link href="">
                      <HStack w="full" justify="space-between">
                        <Text
                          w="full"
                          textAlign="start"
                          fontSize="sm"
                          color="gray"
                        >
                          Privacy
                        </Text>
                        <Icon as={FaChevronRight} />
                      </HStack>
                    </Link>
                  </Box>

                  <Box w="full">
                    {/* TODO: fix href */}
                    <Link href="">
                      <HStack w="full" justify="space-between">
                        <Text
                          w="full"
                          textAlign="start"
                          fontSize="sm"
                          color="gray"
                        >
                          Terms
                        </Text>
                        <Icon as={FaChevronRight} />
                      </HStack>
                    </Link>
                  </Box>

                  <Divider />
                </VStack>

                <Link
                  href="https://warpcast.com/farme-club"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VStack>
                    <Text fontSize="sm" color="gray" as="u">
                      Follow farme on farcaster
                    </Text>

                    <Image src="/images/logo.png" w="40%" alt="farme" />
                  </VStack>
                </Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
);
