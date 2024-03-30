"use client";

import { UserResponseItem, UsersResponse } from "@/models/userResponse";
import { FC, useEffect, useRef, useState } from "react";
import { IUserShape, UserShapeUtil } from "@/components/UserShapeUtil";
import {
  IUserDetailShape,
  UserDetailShapeUtil,
} from "@/components/UserDetailShapeUtil";
import { Tldraw, track, useEditor } from "tldraw";
import { httpClient } from "@/utils/http/client";
import { useRouter } from "next/navigation";
import { Box, Button, HStack, Icon } from "@chakra-ui/react";
import { IoIosArrowBack } from "react-icons/io";

export const Network: FC<{
  user: UserResponseItem;
  hasPrevious: boolean;
}> = ({ user, hasPrevious }) => {
  const customShapeUtils = [UserShapeUtil, UserDetailShapeUtil];

  return (
    <Tldraw hideUi shapeUtils={customShapeUtils}>
      <Content user={user} hasPrevious={hasPrevious} />
    </Tldraw>
  );
};

const Content = track(
  ({ user, hasPrevious }: { user: UserResponseItem; hasPrevious: boolean }) => {
    const editor = useEditor();

    const [isDetailReady, setIsDetailsReady] = useState<boolean>(false);
    const [isNetworkReady, setNetworkReady] = useState<boolean>(false);
    const onceFetch = useRef<boolean>(false);
    const router = useRouter();

    const detailW = 200;
    const detailH = 200;
    useEffect(() => {
      if (!user?.fid) {
        return;
      }

      if (!user.address) {
        return;
      }

      if (onceFetch.current) {
        return;
      }

      const center = editor.getViewportPageCenter();

      editor.createShape<IUserDetailShape>({
        type: "userDetail",
        props: {
          w: 200,
          h: 360,
          fid: user?.fid ?? "0",
          pfp: user?.pfp ?? "",
          displayName: user?.displayName ?? "",
          bio: user?.bio ?? "",
          userName: user?.userName ?? "",
          address: user.address,
          onClick: () => {
            router.push(`/canvas/${user.address}`);
          },
        },
        x: center.x - detailW / 2,
        y: center.y - detailH / 2 - 90,
      });

      editor.updateInstanceState({ canMoveCamera: false });
      setIsDetailsReady(true);
      onceFetch.current = true;

      // Get Network
      (async () => {
        console.log("fetch network");
        const res = await httpClient.get<UsersResponse>(
          `/farcaster/${user?.fid}/network`,
        );
        console.log(res);

        const users = res.data.users;

        const w = 100;
        const h = 100;

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
          const yWeight = 180;

          editor.createShape<IUserShape>({
            type: "user",
            props: {
              w,
              h,
              fid: user?.fid ?? 0,
              pfp: user?.pfp ?? "",
              displayName: user.displayName ?? "",
              bio: user?.bio ?? "",
              userName: user?.userName ?? "",
              address: user.address,
              onClick: () => {
                router.push(`/network/${user.fid}`);
              },
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
              100,
          });
        });

        editor.updateInstanceState({ canMoveCamera: true });

        setNetworkReady(true);
      })();
    }, [user?.fid, user.address]);

    const handleBack = () => {
      router.back();
    };

    return (
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
        <HStack
          pos="absolute"
          bottom={0}
          left={0}
          right={0}
          px={6}
          py={4}
          justify="center"
        >
          {hasPrevious && (
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={IoIosArrowBack} />}
              onClick={handleBack}
              pointerEvents="all"
            >
              Back
            </Button>
          )}
        </HStack>
      </Box>
    );
  },
);