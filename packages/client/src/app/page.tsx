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
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import { baseSepolia, zoraSepolia } from "viem/chains";
import {
  Chain,
  Token,
  TokenContract,
  TokenContentMedia,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { addDays, getUnixTime } from "date-fns";
import { canvasAbi } from "@/utils/contract/generated";
import { canvasAddress, tokenAddress } from "@/utils/contract/address";
import { waitForTransactionReceipt } from "@wagmi/core";
import { keccak256, zeroAddress } from "viem";
import { getDefaultFixedPriceMinterAddress } from "@zoralabs/protocol-sdk";

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
  const fetchTokens = async () => {
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
                ? new URL(
                    `https://remote-image.decentralized-content.com/image?${new URLSearchParams(
                      {
                        url: `https://ipfs-gateway-dev.zoralabs.workers.dev/ipfs/${token.image?.url.split("://")[1]}`,
                        w: "3840",
                        q: "75",
                      }
                    ).toString()}`
                  ).toString()
                : token.image?.url,
          },
        }))
    );
  };
  useEffect(() => {
    if (!address) {
      return;
    }
    (async () => {
      await fetchTokens();
    })();
  }, [address]);

  useEffect(() => {
    console.log("tokens", tokens);
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

    const assetId = shape.props.assetId;
    if (!assetId) {
      throw new Error("assetId is not found");
    }

    const asset = editor.getAsset(assetId);
    if (!asset) {
      throw new Error("asset is not found");
    }

    editor.updateShape({
      ...shape,
      meta: {
        creator: address,
        createdAt: getUnixTime(new Date()),
      },
    });

    editor.updateAssets([
      {
        ...asset,
        props: { ...asset.props, src: image.url },
        meta: {
          tokenContract,
          tokenId,
        },
      },
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

  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const [isDropLoading, setIsDropLoading] = useState<boolean>(false);

  const handleDrop = async () => {
    if (!address) {
      throw new Error("address is not found");
    }
    if (!uploadedShapeId) {
      throw new Error("uploadedShapeId is not found");
    }

    setIsDropLoading(true);

    try {
      const res = await kubo.add({
        path: fileName ?? "",
        content: uploadedFile,
      });

      const metadata = JSON.stringify({
        name: fileName,
        description: ``,
        image: `ipfs://${res.cid}`,
        decimals: 0,
        animation_url: "",
      });

      const metaRes = await kubo.add({
        path: `${fileName}-metadata`,
        content: metadata,
      });

      const salesConfig = {
        saleStart: BigInt(getUnixTime(new Date())),
        saleEnd: BigInt(getUnixTime(addDays(new Date(), 10))),
        maxTokensPerAddress: BigInt(0),
        pricePerToken: BigInt(0),
        fundsRecipient: zeroAddress,
      };

      const result = await writeContractAsync({
        abi: canvasAbi,
        address: canvasAddress,
        functionName: "createSticker",
        args: [
          tokenAddress,
          `ipfs://${metaRes.cid.toString()}`,
          BigInt(Number.MAX_SAFE_INTEGER),
          getDefaultFixedPriceMinterAddress(zoraSepolia.id),
          salesConfig,
        ],
      });

      await waitForTransactionReceipt(config, {
        hash: result,
        onReplaced: (res) => {
          console.log("onReplaced", res);
        },
      });

      // TODO: fix
      const tokenContract: TokenContract = {
        chain: zoraSepolia.id,
        network: ZDKNetwork.Zora,
        collectionAddress: tokenAddress,
      };
      const tokenId = 1;

      const shape = editor.getShape<TLImageShape>(uploadedShapeId as TLShapeId);

      if (!shape) {
        throw new Error("shape is not found");
      }

      const assetId = shape.props.assetId;
      if (!assetId) {
        throw new Error("assetId is not found");
      }

      const asset = editor.getAsset(assetId);
      if (!asset) {
        throw new Error("asset is not found");
      }

      editor.updateShape({
        ...shape,
        meta: {
          creator: address,
          createdAt: getUnixTime(new Date()),
        },
      });

      editor.updateAssets([
        {
          ...asset,
          props: {
            ...asset.props,
            src: `https://ipfs.io/ipfs/${res.cid.toString()}`,
          },
          meta: {
            tokenContract,
            tokenId,
          },
        },
      ]);

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
    } catch (e) {
      console.error(e);
    } finally {
      setIsDropLoading(false);
    }
  };

  const handleSave = () => {
    const snapshot = editor.store.getSnapshot();
    const stringified = JSON.stringify(snapshot);
    console.log(stringified);
  };

  const handleStickerOpen = async () => {
    onStickerOpen();
    await fetchTokens();
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
                  isLoading={isDropLoading}
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
                onClick={handleStickerOpen}
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
