"use client";

import {
  IndexKey,
  TLAsset,
  TLAssetId,
  TLImageAsset,
  TLImageShape,
  TLParentId,
  TLShapeId,
  Tldraw,
  track,
  useEditor,
} from "tldraw";
import {
  Box,
  Button,
  Center,
  Drawer,
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
import { useEffect, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { PiSticker } from "react-icons/pi";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { LuLogOut, LuSave } from "react-icons/lu";
import { create as createKubo } from "kubo-rpc-client";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { ZDK, ZDKNetwork } from "@zoralabs/zdk";
import { zoraSepolia } from "viem/chains";
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
import {
  Address,
  decodeEventLog,
  encodePacked,
  fromHex,
  keccak256,
  toHex,
  zeroAddress,
} from "viem";
import { getDefaultFixedPriceMinterAddress } from "@zoralabs/protocol-sdk";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home({ params }: { params: { address: Address } }) {
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
            <Canvas canvasOwner={params.address} />
          </Tldraw>
        </Box>
      </Box>
    </main>
  );
}

const Canvas = track(({ canvasOwner }: { canvasOwner: Address }) => {
  const editor = useEditor();
  const { address } = useAccount();
  const { data: session } = useSession();

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

  const { data: canvasData, isFetched: isCanvasFetched } = useReadContract({
    abi: canvasAbi,
    address: canvasAddress,
    functionName: "getCanvas",
    args: [canvasOwner],
  });

  const decodeFloat = ({
    decimal,
    value,
  }: {
    decimal: number;
    value: bigint;
  }): number => {
    if (decimal == 0) {
      return Number(value);
    }
    return parseFloat(
      `${value.toString().slice(0, decimal)}.${value.toString().slice(decimal)}`,
    );
  };

  const [lastSave, setLastSave] = useState<number>(0);

  useEffect(() => {
    if (isCanvasFetched && canvasData != undefined) {
      canvasData[1].forEach((asset) => {
        const assetId = fromHex(
          keccak256(
            encodePacked(
              ["uint256", "address", "uint256"],
              [asset.tokenID, asset.contractAddress, asset.chainID],
            ),
          ),
          "bigint",
        );
        const assets: TLAsset[] = [
          {
            meta: {
              tokenContract: {
                name: "",
                network: "",
                description: null,
                collectionAddress: asset.contractAddress,
                symbol: "",
                chain: Number(asset.chainID),
              },
              tokenId: Number(asset.tokenID),
            },
            id: `asset:${assetId}` as TLAssetId,
            type: "image",
            typeName: "asset",
            props: {
              name: asset.srcName,
              src: asset.srcURI,
              w: decodeFloat(asset.w),
              h: decodeFloat(asset.h),
              mimeType: asset.mineType,
              isAnimated: asset.mineType == "image/gif",
            },
          },
        ];

        editor.createAssets(assets);
      });

      canvasData[0].forEach((shape) => {
        editor.createShape({
          x: decodeFloat(shape.x),
          y: decodeFloat(shape.y),
          rotation: decodeFloat(shape.rotation),
          isLocked: shape.creator != address && canvasOwner != address,
          opacity: 1,
          meta: {
            creator: shape.creator,
            createdAt: Number(shape.createdAt),
          },
          id: `shape:${shape.id}` as TLShapeId,
          type: "image",
          props: {
            w: decodeFloat(shape.w),
            h: decodeFloat(shape.h),
            assetId: `asset:${shape.assetID}`,
            playing: true,
            url: "",
            crop: null,
          },
          parentId: "page:page" as TLParentId,
          index: shape.index as IndexKey,
          typeName: "shape",
        });
      });

      editor.zoomToContent();
      editor.zoomOut();

      setLastSave(editor.store.history.get());
    }
  }, [canvasData, isCanvasFetched]);

  const [tokens, setTokens] = useState<Token[]>();

  const getIPFSPreviewURL = (cid: string) => {
    return new URL(
      `https://remote-image.decentralized-content.com/image?${new URLSearchParams(
        {
          url: `https://ipfs-gateway-dev.zoralabs.workers.dev/ipfs/${cid}`,
          w: "3840",
          q: "75",
        },
      ).toString()}`,
    ).toString();
  };

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
                ? getIPFSPreviewURL(token.image?.url.split("://")[1])
                : token.image?.url,
          },
        })),
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
        (s) => s.toString() != selectedShapeId,
      );
      editor.updateShapes(
        filtered.map((s) => ({
          id: s,
          type: "image",
          opacity: 0.5,
          isLocked: true,
        })),
      );
    } else {
      editor.updateShapes(
        allShapeIds.map((s) => ({
          id: s,
          type: "image",
          opacity: 1,
          isLocked: false,
        })),
      );
    }
  }, [selectedShapeId]);

  const handleInsertSticker = async (
    tokenContract: TokenContract | null | undefined,
    tokenId: string,
    image: TokenContentMedia | null | undefined,
    name: string | null | undefined,
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
      editor.getSelectedShapeIds()[0],
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 0.5,
        isLocked: true,
      })),
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
      })),
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

    const shape = editor.getShape<TLImageShape>(uploadedShapeId as TLShapeId);

    if (!shape) {
      throw new Error("shape is not found");
    }

    const assetId = shape.props.assetId;
    if (!assetId) {
      throw new Error("assetId is not found");
    }

    const asset = editor.getAsset(assetId) as TLImageAsset | undefined;
    if (!asset) {
      throw new Error("asset is not found");
    }

    if (
      session == null ||
      session.user == undefined ||
      session.user.id == undefined
    ) {
      throw new Error("fid is not found");
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
          `ipfs://${metaRes.cid.toString()}`,
          {
            tokenID: BigInt(0),
            contractAddress: tokenAddress,
            chainID: BigInt(0),
            srcURI: getIPFSPreviewURL(res.cid.toString()),
            srcName: fileName ?? "",
            mineType: asset.props.mimeType ?? "",
            w: encodeFloat(asset.props.w),
            h: encodeFloat(asset.props.h),
          },
          {
            id: fromHex(keccak256(toHex(shape.id)), "bigint"),
            x: encodeFloat(shape.x),
            y: encodeFloat(shape.y),
            rotation: encodeFloat(shape.rotation),
            creator: address,
            createdAt: BigInt(getUnixTime(new Date())),
            fid: BigInt(session.user.id),
            assetID: BigInt(0),
            w: encodeFloat(shape.props.w),
            h: encodeFloat(shape.props.h),
            index: shape.index,
          },
          BigInt(Number.MAX_SAFE_INTEGER),
          getDefaultFixedPriceMinterAddress(zoraSepolia.id),
          salesConfig,
        ],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      const event = receipt.logs.filter(
        (l) => l.address.toLowerCase() == canvasAddress.toLowerCase(),
      )[0];

      const decodedLog = decodeEventLog({
        abi: canvasAbi,
        data: event.data,
        topics: event.topics,
      });

      const tokenContract: TokenContract = {
        chain: zoraSepolia.id,
        network: ZDKNetwork.Zora,
        collectionAddress: tokenAddress,
      };
      const tokenId = Number(decodedLog.args.id);

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
            src: getIPFSPreviewURL(res.cid.toString()),
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
        })),
      );
      setLastSave(editor.store.history.get());
    } catch (e) {
      console.error(e);
    } finally {
      setIsDropLoading(false);
    }
  };

  const encodeFloat = (number: number) => {
    const dec = number.toString().indexOf(".");
    return {
      decimal: dec != -1 ? dec : 0,
      value: BigInt(number.toString().replace(".", "")),
    };
  };

  const handleSave = async () => {
    if (canvasOwner == undefined) {
      throw new Error("canvasOwner is not found");
    }

    if (
      session == null ||
      session.user == undefined ||
      session.user.id == undefined
    ) {
      throw new Error("fid is not found");
    }

    const snapshot = editor.store.getSnapshot();

    const stringified = JSON.stringify(snapshot);
    console.log(stringified);

    const shapes = Object.values(snapshot.store).filter(
      (s) => s.typeName == "shape",
    ) as TLImageShape[];

    type ImageAsset = TLImageAsset & { assetId: bigint };

    const assets = Object.values(snapshot.store)
      .filter((s) => s.typeName == "asset")
      .map((asset) => {
        const a = asset as TLImageAsset;
        const tokenContract = a.meta.tokenContract as {
          collectionAddress: Address;
          chain: number;
        };

        return {
          ...a,
          assetId: fromHex(
            keccak256(
              encodePacked(
                ["uint256", "address", "uint256"],
                [
                  BigInt((a.meta.tokenId as number) ?? 0),
                  tokenContract.collectionAddress,
                  BigInt(tokenContract.chain),
                ],
              ),
            ),
            "bigint",
          ),
        };
      }) as ImageAsset[];

    const formattedAssets = assets.map((a) => {
      const tokenContract = a.meta.tokenContract as {
        collectionAddress: Address;
        chain: number;
      };
      return {
        tokenID: BigInt((a.meta.tokenId as number) ?? 0),
        contractAddress: tokenContract.collectionAddress,
        chainID: BigInt(tokenContract.chain),
        srcURI: a.props.src ?? "",
        srcName: a.props.name ?? "",
        mineType: a.props.mimeType ?? "",
        w: encodeFloat(a.props.w),
        h: encodeFloat(a.props.h),
      };
    });

    const formattedShapes = shapes.map((s) => {
      const asset = assets.find((a) => a.id == s.props.assetId);
      if (asset == undefined) {
        throw new Error("asset is not found");
      }

      return {
        id: fromHex(keccak256(toHex(s.id)), "bigint"),
        x: encodeFloat(s.x),
        y: encodeFloat(s.y),
        rotation: encodeFloat(s.rotation),
        creator: s.meta.creator as Address,
        createdAt: BigInt(s.meta.createdAt as number),
        fid: BigInt(session.user!.id),
        assetID: asset.assetId,
        w: encodeFloat(s.props.w),
        h: encodeFloat(s.props.h),
        index: s.index,
      };
    });

    const result = await writeContractAsync({
      abi: canvasAbi,
      address: canvasAddress,
      functionName: "editCanvas",
      args: [canvasOwner, formattedShapes, formattedAssets],
    });

    await waitForTransactionReceipt(config, {
      hash: result,
      onReplaced: (res) => {
        console.log("onReplaced", res);
      },
    });
  };

  const handleStickerOpen = async () => {
    onStickerOpen();
    await fetchTokens();
  };

  const router = useRouter();
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
              <IconButton
                aria-label="save"
                icon={<Icon as={IoIosArrowBack} />}
                colorScheme="blue"
                rounded="full"
                shadow="xl"
                pointerEvents="all"
                size="lg"
                onClick={handleBack}
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
                      token.name,
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
