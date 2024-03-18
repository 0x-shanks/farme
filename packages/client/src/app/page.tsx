"use client";

import {
  AssetRecordType,
  TLImageShape,
  TLShapeId,
  Tldraw,
  track,
  useActions,
  useEditor,
} from "tldraw";
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Spacer,
  Spinner,
  VStack,
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { PiSticker } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { LuSave } from "react-icons/lu";
import { create as createKubo } from "kubo-rpc-client";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import { baseSepolia, zoraSepolia } from "viem/chains";
import {
  Chain,
  Token,
  TokenContract,
  TokenContentMedia,
} from "@zoralabs/zdk/dist/queries/queries-sdk";

export default function Home() {
  const { ready, authenticated, login, user } = usePrivy();

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
          <Tldraw hideUi>
            <Tools />
          </Tldraw>
        </Box>
      </Box>
    </main>
  );
}

const Tools = track(() => {
  const editor = useEditor();
  const { address } = useAccount();

  const API_ENDPOINT = "https://api.zora.co/graphql";
  const args = {
    endPoint: API_ENDPOINT,
    networks: [
      {
        network: ZDKNetwork.Zora,
        chain: "ZORA_SEPOLIA" as Chain,
      },
    ],
    // apiKey: process.env.API_KEY,
  };

  const zdk = new ZDK(args);

  const [tokens, setTokens] = useState<Token[]>();
  useEffect(() => {
    if (!address) {
      return;
    }
    (async () => {
      const tokens = await zdk.tokens({
        where: {
          ownerAddresses: [address ?? ""],
        },
      });

      setTokens(
        tokens.tokens.nodes
          .map((n) => n.token as Token)
          .map((token) => ({
            ...token,
            image: {
              ...token.image,
              url:
                token.image?.url?.split(":")[0] == "ipfs"
                  ? `https://ipfs.io/ipfs/${token.image?.url.split("://")[1]}`
                  : token.image?.url,
            },
          }))
      );
    })();
  }, [address]);

  useEffect(() => {
    console.log(tokens);
  }, [tokens]);

  const {
    isOpen: isStickerOpen,
    onOpen: onStickerOpen,
    onClose: onStickerClose,
  } = useDisclosure();
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [uploadedShapeId, setUploadedShapeId] = useState<string>();
  const [selectedShapeId, setSelectedShapeId] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  const kubo = createKubo({ url: "https://ipfs-uploader.zora.co/api/v0" });

  editor.store.listen((entry) => {
    if (entry.changes.updated.hasOwnProperty("instance_page_state:page:page")) {
      const updatedEntry =
        //@ts-ignore
        entry.changes.updated["instance_page_state:page:page"];
      if (
        updatedEntry &&
        updatedEntry.length > 0 &&
        updatedEntry[1].hasOwnProperty("selectedShapeIds") &&
        updatedEntry[1].selectedShapeIds[0] != selectedShapeId
      ) {
        setSelectedShapeId(updatedEntry[1].selectedShapeIds[0]);
      }
    }
  });

  useEffect(() => {
    if (uploadedFile) {
      return;
    }

    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());

    if (selectedShapeId) {
      const filtered = allShapeIds.filter(
        (s) => s.toString() != selectedShapeId
      );
      editor.updateShapes(
        filtered.map((s) => ({
          id: s,
          type: "image",
          opacity: 0.5,
          isLocked: true,
        }))
      );
    } else {
      editor.updateShapes(
        allShapeIds.map((s) => ({
          id: s,
          type: "image",
          opacity: 1,
          isLocked: false,
        }))
      );
    }
  }, [selectedShapeId]);

  const handleInsertSticker = async (
    tokenContract: TokenContract | null | undefined,
    tokenId: string,
    image: TokenContentMedia | null | undefined,
    name: string | null | undefined
  ) => {
    if (!tokenContract) {
      throw new Error("tokenContract is not found");
    }

    if (!tokenId) {
      throw new Error("tokenId is not found");
    }

    if (!image) {
      throw new Error("image is not found");
    }

    if (!image.url) {
      throw new Error("image url is not found");
    }

    if (!image.mimeType) {
      throw new Error("image mimeType is not found");
    }

    const res = await fetch(image.url);
    const blob = await res.blob();
    const file = new File([blob], name ?? "", { type: image.mimeType });

    await editor.putExternalContent({
      type: "files",
      files: [file],
      point: editor.getViewportPageBounds().center,
      ignoreParent: false,
    });

    const shape = editor.getShape<TLImageShape>(
      editor.getSelectedShapeIds()[0]
    );

    if (!shape) {
      throw new Error("shape is not found");
    }

    editor.updateShape({
      ...shape,
      meta: {
        tokenContract,
        tokenId,
        maker: address,
      },
    });

    const assetId = shape.props.assetId;
    if (!assetId) {
      throw new Error("assetId is not found");
    }

    const asset = editor.getAsset(assetId);
    if (!asset) {
      throw new Error("asset is not found");
    }

    editor.updateAssets([
      { ...asset, props: { ...asset.props, src: image.url } },
    ]);

    onStickerClose();
  };

  const handleInsertImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 0.5,
        isLocked: true,
      }))
    );

    const file = event.target.files?.[0];
    if (file == null) {
      return;
    }

    setUploadedFile(file);

    await editor.putExternalContent({
      type: "files",
      files: [file],
      point: editor.getViewportPageBounds().center,
      ignoreParent: false,
    });

    setUploadedShapeId(editor.getSelectedShapeIds()[0]);
    setFileName(file.name);
  };

  const handleDeleteImage = () => {
    editor.deleteShapes(editor.getSelectedShapeIds());
    setUploadedFile(undefined);
    setUploadedShapeId(undefined);
    setFileName("");
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 1,
        isLocked: false,
      }))
    );
  };

  const handleDrop = async () => {
    if (!uploadedShapeId) {
      throw new Error("uploadedShapeId is not found");
    }

    const res = await kubo.add({
      path: fileName ?? "",
      content: uploadedFile,
    });

    const url = `https://ipfs.io/ipfs/${res.cid.toString()}`;

    // TODO: fix
    const tokenContract: TokenContract = {
      chain: zoraSepolia.id,
      network: ZDKNetwork.Zora,
      collectionAddress: "0x",
    };
    const tokenId = 1;

    const shape = editor.getShape<TLImageShape>(uploadedShapeId as TLShapeId);

    if (!shape) {
      throw new Error("shape is not found");
    }

    editor.updateShape({
      ...shape,
      meta: {
        tokenContract,
        tokenId,
        maker: address,
      },
    });

    const assetId = shape.props.assetId;
    if (!assetId) {
      throw new Error("assetId is not found");
    }

    const asset = editor.getAsset(assetId);
    if (!asset) {
      throw new Error("asset is not found");
    }

    editor.updateAssets([{ ...asset, props: { ...asset.props, src: url } }]);

    setUploadedFile(undefined);
    setUploadedShapeId(undefined);
    setFileName("");
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 1,
        isLocked: false,
      }))
    );
  };

  const handleSave = () => {
    const snapshot = editor.store.getSnapshot();
    const stringified = JSON.stringify(snapshot);
    console.log(stringified);
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
        justify="space-between"
      >
        {uploadedFile ? (
          <>
            <Spacer />
            <VStack>
              <Input
                onChange={(e) => setFileName(e.target.value)}
                value={fileName}
                pointerEvents="all"
              />
              <HStack>
                <IconButton
                  aria-label="insert image"
                  icon={<Icon as={IoMdClose} />}
                  colorScheme="gray"
                  rounded="full"
                  shadow="xl"
                  pointerEvents="all"
                  onClick={handleDeleteImage}
                  size="lg"
                />
                <Button
                  pointerEvents="all"
                  colorScheme="blue"
                  shadow="xl"
                  rounded="full"
                  size="lg"
                  onClick={handleDrop}
                >
                  Drop
                </Button>
              </HStack>
            </VStack>
            <Spacer />
          </>
        ) : (
          <>
            <HStack>
              <IconButton
                aria-label="insert image"
                icon={<Icon as={PiSticker} />}
                colorScheme="blue"
                rounded="full"
                shadow="xl"
                pointerEvents="all"
                size="lg"
                onClick={onStickerOpen}
              />

              <Box pos="relative" pointerEvents="all">
                <IconButton
                  aria-label="insert image"
                  icon={<Icon as={CiImageOn} />}
                  colorScheme="blue"
                  rounded="full"
                  shadow="xl"
                  size="lg"
                />
                <Box>
                  <Input
                    type="file"
                    position="absolute"
                    top="0"
                    left="0"
                    opacity="0"
                    aria-hidden="true"
                    accept="image/*"
                    multiple={false}
                    onChange={handleInsertImage}
                  />
                </Box>
              </Box>
            </HStack>
            <HStack>
              <IconButton
                aria-label="save"
                icon={<Icon as={LuSave} />}
                colorScheme="blue"
                rounded="full"
                shadow="xl"
                pointerEvents="all"
                size="lg"
                onClick={handleSave}
              />
            </HStack>
          </>
        )}
      </HStack>

      <Drawer
        placement="bottom"
        onClose={onStickerClose}
        isOpen={isStickerOpen}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Sticker</DrawerHeader>
          {tokens == undefined && (
            <Center w="full" h="full">
              <Spinner />
            </Center>
          )}
          <SimpleGrid columns={3} spacing={6} px={6}>
            {tokens?.map((token) => (
              <GridItem
                key={token.tokenContract?.collectionAddress + token.tokenId}
              >
                <Button
                  w="full"
                  h="full"
                  variant="unstyled"
                  onClick={() =>
                    handleInsertSticker(
                      token.tokenContract,
                      token.tokenId,
                      token.image,
                      token.name
                    )
                  }
                >
                  <Image src={token.image?.url ?? ""} alt={token.name ?? ""} />
                </Button>
              </GridItem>
            ))}
          </SimpleGrid>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});
