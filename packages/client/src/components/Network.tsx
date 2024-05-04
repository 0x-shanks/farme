'use client';

import { UserResponseItem, UsersResponse } from '@/models/userResponse';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
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
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  DrawerFooter,
  Skeleton,
  useToast
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
import { signOut, useSession } from 'next-auth/react';
import { useLocalStorage } from 'usehooks-ts';
import { MdLogin } from 'react-icons/md';
import { getMintDuration } from '@/utils/getMintDuration';
import {
  defaultChain,
  privacyPolicyLink,
  siteOrigin,
  termsLink
} from '@/app/constants';
import { getImageCircles } from '@/utils/image/getImageCircles';
import { vibur } from '@/app/fonts';
import { CircleImageResponse } from '@/models/circleImageResponse';
import { CreateCircleMappingRequest } from '@/models/createCircleMappingRequest';
import * as Sentry from '@sentry/nextjs';
import imageCompression from 'browser-image-compression';

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
    const { logout, authenticated } = usePrivy();
    const [defaultExpiredPeriod, setDefaultExpiredPeriod] =
      useLocalStorage<number>('expiredPeriod', 5);
    const [profileImageUrls, setProfileImageUrls] = useState<string[]>([]);

    const onceCanvasFetch = useRef<boolean>(false);
    const {
      data: canvasData,
      isSuccess: isCanvasSuccess,
      refetch: refetchCanvas,
      isRefetching: isCanvasRefetching
    } = useReadContract({
      abi: canvasAbi,
      address: canvasAddress,
      functionName: 'getCanvas',
      args: [user.address!],
      query: {
        enabled: user.address != undefined
      },
      chainId: defaultChain.id // NOTE:
    });

    const detailW = 200;
    const detailH = 360;

    // NOTE: refetch canvas when back into home
    useEffect(() => {
      if (isCanvasSuccess && !onceCanvasFetch.current) {
        console.log('refetch canvas');
        refetchCanvas();
        onceCanvasFetch.current = true;
      }
    }, []);

    useEffect(() => {
      if (!user?.fid) {
        return;
      }

      if (!user.address) {
        return;
      }

      if (!isCanvasSuccess || isCanvasRefetching) {
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
          case 7:
          case 2:
          case 4:
            xOffset = -1;
            break;
          case 1:
          case 3:
          case 6:
            xOffset = 1;
            break;
        }

        let yOffset: number = 0;
        switch (offset) {
          case 0:
          case 1:
          case 7:
            yOffset = -1;
            break;
          case 4:
          case 5:
          case 6:
            yOffset = 1;
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
        const count = new Map<number, number>();

        canvasData[0].forEach((shape) => {
          const fid = Number(shape.fid);
          const s = count.get(fid);
          if (s == undefined) {
            count.set(fid, 1);
          } else {
            count.set(fid, s + 1);
          }
        });

        const queryParams = Array.from(count.keys())
          .map((i) => {
            const s = count.get(i);
            return `init=${i}:${s}`;
          })
          .join('&');

        const res = await httpClient.get<UsersResponse>(
          `/farcaster/${user?.fid}/network?${queryParams}`
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

        setProfileImageUrls([
          user.pfp ?? '',
          ...(users.map((u) => u.pfp).filter((i) => i != undefined) as string[])
        ]);

        setNetworkReady(true);
      })();
    }, [user?.fid, user.address, isCanvasSuccess, isCanvasRefetching]);

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

    const expiredPeriod = useMemo(
      () => getMintDuration(defaultExpiredPeriod),
      [defaultExpiredPeriod]
    );

    const urlToFile = async (url: string) => {
      const params = new URLSearchParams({
        url
      });
      const response = await fetch(`/api/proxy?${params.toString()}`);
      const blob = await response.blob();
      const file = new File([blob], '', { type: blob.type });
      return file;
    };

    useEffect(() => {
      if (!isNetworkReady) {
        return;
      }

      (async () => {
        const files = await Promise.all(
          profileImageUrls.map(async (url) => await urlToFile(url))
        );

        const blob = await getImageCircles(files);
        setCircleBlob(blob);
      })();
    }, [isNetworkReady]);

    const [circleBlob, setCircleBlob] = useState<Blob>();

    const {
      isOpen: isCircleOpen,
      onOpen: onCircleOpen,
      onClose: onCircleClose
    } = useDisclosure();

    const [progressMessage, setProgressMessage] = useState<string>('');
    const [isPrepareCircleLoading, setIsPrepareCircleLoading] =
      useState<boolean>(false);
    const [isPrepareCircleSuccess, setIsPrepareCircleSuccess] =
      useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [storageCircleImageUrl, setStorageCircleImageUrl] =
      useState<string>('');

    const { data: session } = useSession();
    const { user: privyUser } = usePrivy();

    const prepareImage = async () => {
      if (!circleBlob) {
        throw new Error('circleBlob is not found');
      }
      if (!user.fid) {
        throw new Error('fid is not found');
      }
      setIsPrepareCircleLoading(true);
      try {
        const circleImageFile = new File([circleBlob], '', {
          type: circleBlob.type
        });

        setProgressMessage('Preparing to make the image...');
        const compressedImage = await imageCompression(circleImageFile, {
          maxWidthOrHeight: 1000
        });

        const formData = new FormData();
        formData.append('file', compressedImage);

        const res = await httpClient.post<CircleImageResponse>(
          `/circle/image?fid=${user.fid}`,
          formData
        );

        setStorageCircleImageUrl(res.data.url);

        const split = res.data.url.split('/');
        const hash = split[split.length - 1].replace('.png', '');

        const circleReq: CreateCircleMappingRequest = { fid: user.fid, hash };
        setProgressMessage('Preparing to make frames...');
        await httpClient.post('circle/mapping', circleReq);
        setIsPrepareCircleSuccess(true);
      } catch (e) {
        Sentry.captureException(e, {
          tags: {
            action: 'circle',
            userAddress: privyUser?.wallet?.address,
            userFid: session?.user?.id,
            userName: session?.user?.name,
            privyId: privyUser?.id,
            walletConnectorType: privyUser?.wallet?.connectorType,
            walletClientType: privyUser?.wallet?.walletClientType
          }
        });
        if (e instanceof Error) {
          setErrorMessage(e.message);
        } else {
          setErrorMessage('Unknown error');
        }
        setProgressMessage('');
        setStorageCircleImageUrl('');
      } finally {
        setProgressMessage('');
        setIsPrepareCircleLoading(false);
      }
    };

    useEffect(() => {
      if (!isCircleOpen) {
        return;
      }

      (async () => {
        await prepareImage();
      })();
    }, [isCircleOpen]);

    const handleCircleClose = () => {
      setIsPrepareCircleLoading(false);
      setIsPrepareCircleSuccess(false);
      setProgressMessage('');
      setErrorMessage('');
      setStorageCircleImageUrl('');
      onCircleClose();
    };

    const circleUrl = useMemo(() => {
      if (circleBlob == undefined) {
        return undefined;
      }
      return URL.createObjectURL(circleBlob);
    }, [circleBlob]);

    const shareLink = useMemo(() => {
      if (storageCircleImageUrl == undefined) {
        return undefined;
      }

      const split = storageCircleImageUrl.split('/');
      if (split == undefined) {
        return undefined;
      }
      const hash = split[split.length - 1].replace('.png', '');

      const params = {
        text: 'My farme circle✨',
        parentUrl: 'https://warpcast.com/~/channel/farme',
        'embeds[]': `${siteOrigin}/frames/circle/${hash}`
      };
      return `https://warpcast.com/~/compose?${new URLSearchParams(params).toString()}`;
    }, [storageCircleImageUrl]);

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
          {authenticated ? (
            <>
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

              {pathname == '/' && !!circleBlob && (
                <Box
                  pointerEvents="all"
                  pos="absolute"
                  bottom={8}
                  right={0}
                  px={6}
                  py={4}
                >
                  <Button
                    variant="unstyled"
                    h={70}
                    w={70}
                    overflow="hidden"
                    rounded="md"
                    onClick={onCircleOpen}
                  >
                    <Image
                      src={circleUrl}
                      h={70}
                      w={70}
                      transform="scale(1.5)"
                    />
                  </Button>
                </Box>
              )}

              <HStack
                pos="absolute"
                bottom={8}
                left={0}
                right={0}
                px={6}
                py={4}
                justify="center"
              >
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
            </>
          ) : (
            <HStack
              pos="absolute"
              bottom={8}
              left={0}
              right={0}
              px={6}
              py={4}
              justify="center"
            >
              <Link href="/">
                <Button
                  colorScheme="primary"
                  leftIcon={<Icon as={MdLogin} />}
                  pointerEvents="all"
                >
                  Login
                </Button>
              </Link>
            </HStack>
          )}
        </Box>

        <Drawer
          placement="bottom"
          onClose={handleCircleClose}
          isOpen={isCircleOpen}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader className={vibur.className} fontSize="4xl">
              Share your circle
            </DrawerHeader>
            <DrawerBody w="full">
              <VStack w="full">
                <Text fontWeight="bold" fontSize="lg">
                  Share farme circle on farcaster
                </Text>
                <Image src={circleUrl} w="70%" />
                {progressMessage && (
                  <HStack w="full" justify="center">
                    <Skeleton
                      w={2}
                      h={2}
                      startColor="green.400"
                      endColor="green.100"
                      rounded="full"
                    />
                    <Text size="sm">{progressMessage}</Text>
                  </HStack>
                )}
                {errorMessage && (
                  <HStack w="full" justify="center">
                    <Box w={2} h={2} bgColor="red.400" rounded="full" />
                    <Text size="sm">{errorMessage}</Text>
                  </HStack>
                )}
                {isPrepareCircleSuccess && (
                  <Text size="sm">Ready to share🎉</Text>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter pb={12}>
              <Link
                href={shareLink ?? ''}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  colorScheme="primary"
                  rounded="full"
                  isDisabled={!isPrepareCircleSuccess || !shareLink}
                  pointerEvents={
                    isPrepareCircleSuccess && shareLink ? 'all' : 'none'
                  }
                >
                  Share on farcaster
                </Button>
              </Link>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer
          placement="bottom"
          onClose={onSettingClose}
          isOpen={isSettingOpen}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader className={vibur.className} fontSize="4xl">
              Settings
            </DrawerHeader>
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
                  <Text textAlign="start" w="full">
                    Default mint duration
                  </Text>

                  <Text w="full" textAlign="start" fontSize="sm" color="gray">
                    Set default mint duration when dropping stickers
                  </Text>

                  <HStack w="full">
                    <Text w={40}>{expiredPeriod?.label}</Text>
                    <Slider
                      aria-label="expired"
                      defaultValue={defaultExpiredPeriod}
                      min={0}
                      max={9}
                      colorScheme="primary"
                      pointerEvents="all"
                      onChange={setDefaultExpiredPeriod}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={5} />
                    </Slider>
                  </HStack>

                  <Divider />
                </VStack>

                <VStack w="full">
                  <HStack w="full" justify="space-between">
                    <Text>Privacy and terms</Text>
                  </HStack>

                  <Box w="full">
                    <Link
                      href={privacyPolicyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HStack w="full" justify="space-between">
                        <Text
                          w="full"
                          textAlign="start"
                          fontSize="sm"
                          color="gray"
                        >
                          Privacy Policy
                        </Text>
                        <Icon as={FaChevronRight} />
                      </HStack>
                    </Link>
                  </Box>

                  <Box w="full">
                    <Link
                      href={termsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HStack w="full" justify="space-between">
                        <Text
                          w="full"
                          textAlign="start"
                          fontSize="sm"
                          color="gray"
                        >
                          End User Terms
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
