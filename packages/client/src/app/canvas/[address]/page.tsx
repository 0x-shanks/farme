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
  exportToBlob,
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
  CardBody,
  Card,
  Text,
  Avatar,
  SkeletonText,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { PiSticker } from "react-icons/pi";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { LuSave } from "react-icons/lu";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { ZDKNetwork } from "@zoralabs/zdk";
import { zoraSepolia } from "viem/chains";
import {
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

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TokensResponse } from "@/models/tokensResponse";
import { ipfsClient } from "@/utils/ipfs/client";
import { httpClient } from "@/utils/http/client";
import { decodeFloat, encodeFloat } from "@/utils/contract/float";
import { getIPFSPreviewURL } from "@/utils/ipfs/utils";
import { UserResponse, UserResponseItem } from "@/models/userResponse";
import { fromUnixTime } from "date-fns";
import { GoTrash } from "react-icons/go";
import { FaCheck } from "react-icons/fa";
import { createReferral } from "@/app/constants";
import { MobileSelectTool } from "@/components/MobileSelectTool";

export default function Home({ params }: { params: { address: Address } }) {
  const customTools = [MobileSelectTool];

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
          <Tldraw hideUi tools={customTools}>
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
  const config = useConfig();
  const router = useRouter();

  editor.setCurrentTool("mobileSelect");

  // States
  const [lastSave, setLastSave] = useState<number>(0);
  const [isDropLoading, setIsDropLoading] = useState<boolean>(false);
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [uploadedShapeId, setUploadedShapeId] = useState<string>();
  const [selectedShapeId, setSelectedShapeId] = useState<string>();
  const [selectedShapeCreator, setSelectedShapeCreator] =
    useState<UserResponseItem>();
  const [fileName, setFileName] = useState<string>();
  const [tokens, setTokens] = useState<Token[]>();

  const {
    isOpen: isStickerOpen,
    onOpen: onStickerOpen,
    onClose: onStickerClose,
  } = useDisclosure();

  // Contract
  const { writeContractAsync } = useWriteContract();
  const { data: canvasData, isFetched: isCanvasFetched } = useReadContract({
    abi: canvasAbi,
    address: canvasAddress,
    functionName: "getCanvas",
    args: [canvasOwner],
  });

  // Memo
  const selectedShape = useMemo(() => {
    if (selectedShapeId == undefined) {
      return undefined;
    }
    return editor.getShape<TLImageShape>(selectedShapeId as TLShapeId);
  }, [selectedShapeId]);

  // Load canvas
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

  // Fetch zora tokens
  const fetchTokens = async () => {
    const res = await httpClient.get<TokensResponse>(`/zora/tokens/${address}`);
    setTokens(res.data.tokens);
  };
  useEffect(() => {
    if (!address) {
      return;
    }
    (async () => {
      try {
        await fetchTokens();
      } catch (e) {
        // TODO: handle
        console.error(e);
      }
    })();
  }, [address]);

  // Watch select token
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

  // Fetch creator of the shape
  useEffect(() => {
    if (selectedShapeId == undefined) {
      return;
    }
    if (session?.user?.id == undefined) {
      return;
    }
    (async () => {
      const res = await httpClient.get<UserResponse>(
        `/farcaster/${session?.user?.id}`,
      );
      setSelectedShapeCreator(res.data.user);
    })();
  }, [selectedShapeId]);

  // Manage saved status
  useEffect(() => {
    if (isSavedSuccess) {
      const timer = setTimeout(() => {
        setIsSavedSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSavedSuccess]);

  //
  // Handler
  //

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
      const res = await ipfsClient.add({
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

      const metaRes = await ipfsClient.add({
        path: `${fileName}-metadata`,
        content: metadata,
      });

      const salesConfig = {
        saleStart: BigInt(getUnixTime(new Date())),
        saleEnd: BigInt(getUnixTime(addDays(new Date(), 10))),
        maxTokensPerAddress: BigInt(0),
        pricePerToken: BigInt(0),
        fundsRecipient: address,
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
          createReferral,
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

    setIsSaveLoading(true);

    try {
      let previewURI = "";

      if (Array.from(editor.getCurrentPageShapeIds()).length > 0) {
        const image = await exportToBlob({
          editor,
          ids: Array.from(editor.getCurrentPageShapeIds()),
          format: "png",
        });

        const res = await ipfsClient.add({
          path: canvasOwner,
          content: image,
        });

        previewURI = getIPFSPreviewURL(res.cid.toString());
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
        args: [canvasOwner, formattedShapes, formattedAssets, previewURI],
      });

      await waitForTransactionReceipt(config, {
        hash: result,
        onReplaced: (res) => {
          console.log("onReplaced", res);
        },
      });

      setIsSavedSuccess(true);
    } catch (e) {
      // TODO: error handle
      console.error(e);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleStickerOpen = async () => {
    onStickerOpen();
    await fetchTokens();
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = () => {
    if (selectedShapeId == undefined) {
      return;
    }

    editor.deleteShape(selectedShapeId as TLShapeId);
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
      <VStack
        pos="absolute"
        bottom={100}
        left={0}
        right={0}
        px={6}
        py={4}
        justify="center"
      >
        {!!selectedShapeId && (
          <Card shadow="lg">
            <CardBody>
              <VStack spacing={1}>
                <Avatar
                  size="sm"
                  src={selectedShapeCreator?.pfp}
                  borderWidth={1}
                  borderColor="white"
                  shadow="lg"
                />
                {selectedShapeCreator && selectedShape ? (
                  <>
                    <Text>{`Made by ${selectedShapeCreator?.displayName}`}</Text>
                    <Text>
                      {fromUnixTime(
                        selectedShape?.meta.createdAt as number,
                      ).toLocaleDateString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <SkeletonText noOfLines={1} w={32} my={2} />
                    <SkeletonText noOfLines={1} w={20} />
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
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

              {selectedShapeId && (
                <IconButton
                  aria-label="delete"
                  icon={<Icon as={GoTrash} />}
                  colorScheme="blue"
                  rounded="full"
                  shadow="xl"
                  pointerEvents="all"
                  size="lg"
                  onClick={handleDelete}
                />
              )}
            </HStack>
            <HStack>
              <IconButton
                aria-label="save"
                icon={<Icon as={isSavedSuccess ? FaCheck : LuSave} />}
                colorScheme="blue"
                rounded="full"
                shadow="xl"
                pointerEvents="all"
                size="lg"
                onClick={handleSave}
                isLoading={isSaveLoading}
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
