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
  Image as ChakraImage,
  CardBody,
  Card,
  Text,
  Avatar,
  SkeletonText,
  background,
  DrawerBody,
  useOutsideClick,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import imageCompression from "browser-image-compression";
import { getImageWithEdge } from "@/utils/image/getImageWithEdge";
import EmojiPicker from "emoji-picker-react";
import { toBase64 } from "@/utils/image/toBase64";
import { getImageWithFrame } from "@/utils/image/getImageWithFrame";
import { getImageRounded } from "@/utils/image/getImageRounded";
import {
  TbStackBack,
  TbStackFront,
  TbStackPop,
  TbStackPush,
} from "react-icons/tb";

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
  const [bgRemovedFile, setBgRemovedFile] = useState<File>();
  const [editedFile, setEditedFile] = useState<File>();
  const [uploadedShapeId, setUploadedShapeId] = useState<TLShapeId>();
  const [selectedShapeId, setSelectedShapeId] = useState<TLShapeId>();
  const [selectedShapeCreator, setSelectedShapeCreator] =
    useState<UserResponseItem>();
  const [fileName, setFileName] = useState<string>();
  const [tokens, setTokens] = useState<Token[]>();

  const {
    isOpen: isStickerOpen,
    onOpen: onStickerOpen,
    onClose: onStickerClose,
  } = useDisclosure();

  const emojiPickerRef = useRef(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  useOutsideClick({
    ref: emojiPickerRef,
    handler: () => setIsEmojiPickerOpen(false),
  });

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
    return editor.getShape<TLImageShape>(selectedShapeId);
  }, [selectedShapeId]);

  // Load canvas
  useEffect(() => {
    if (isCanvasFetched && canvasData != undefined) {
      canvasData[1].forEach((asset) => {
        const assetId = getAssetId(
          asset.tokenID.toString(),
          asset.contractAddress,
          asset.chainID,
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
              onchainAssetId: assetId.toString(),
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
            onchainShapeId: shape.id.toString(),
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
  // Util
  //

  const getPreviewURL = async () => {
    let previewURI = "";

    if (Array.from(editor.getCurrentPageShapeIds()).length > 0) {
      const image = await exportToBlob({
        editor,
        ids: Array.from(editor.getCurrentPageShapeIds()),
        format: "png",
        opts: { background: false },
      });

      const imageFile = new File([image], "", {
        type: "image/png",
      });
      const compressedImage = await imageCompression(imageFile, {
        maxWidthOrHeight: 500,
      });

      const res = await ipfsClient.add({
        content: compressedImage,
        path: canvasOwner,
      });

      previewURI = getIPFSPreviewURL(res.cid.toString());
    }
    return previewURI;
  };

  const getAssetId = (
    tokenId: string,
    collectionAddress: Address,
    chain: bigint,
  ) => {
    const rawAssetId = fromHex(
      keccak256(
        encodePacked(
          ["uint256", "address", "uint256"],
          [BigInt(tokenId), collectionAddress, BigInt(chain)],
        ),
      ),
      "bigint",
    );
    return rawAssetId;
  };

  const getShapeId = (creator: Address, createdAt: bigint) => {
    const rawShapeId = fromHex(
      keccak256(encodePacked(["address", "uint256"], [creator, createdAt])),
      "bigint",
    );

    return rawShapeId;
  };

  //
  // Handler
  //

  const handleInsertSticker = async (
    tokenContract: TokenContract | null | undefined,
    tokenId: string,
    image: TokenContentMedia | null | undefined,
    name: string | null | undefined,
  ) => {
    if (!address) {
      throw new Error("address is not found");
    }

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

    const rawAssetId = getAssetId(
      tokenId,
      tokenContract.collectionAddress as Address,
      BigInt(tokenContract.chain),
    );

    const now = getUnixTime(new Date());
    const rawShapeId = getShapeId(address, BigInt(now));

    editor.updateShape({
      ...shape,
      meta: {
        creator: address,
        createdAt: now,
        onchainShapeId: rawShapeId.toString(),
      },
    });

    editor.updateAssets([
      {
        ...asset,
        props: { ...asset.props, src: image.url },
        meta: {
          tokenContract,
          tokenId,
          onchainAssetId: rawAssetId.toString(),
        },
      },
    ]);

    onStickerClose();
  };

  const handleInsertImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!address) {
      throw new Error("address is not found");
    }

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

    const compressedImage = await imageCompression(file, {
      maxWidthOrHeight: 1000,
    });

    setUploadedFile(compressedImage);
    setEditedFile(compressedImage);

    await editor.putExternalContent({
      type: "files",
      files: [compressedImage],
      point: editor.getViewportPageBounds().center,
      ignoreParent: false,
    });

    const shape = editor.getShape<TLImageShape>(
      editor.getSelectedShapeIds()[0],
    );

    if (!shape) {
      throw new Error("shape is not found");
    }

    const now = getUnixTime(new Date());
    const rawShapeId = getShapeId(address, BigInt(now));

    editor.updateShape({
      ...shape,
      meta: {
        creator: address,
        createdAt: now,
        onchainShapeId: rawShapeId.toString(),
      },
    });

    setUploadedShapeId(editor.getSelectedShapeIds()[0]);
    setFileName("😃");

    const formData = new FormData();
    formData.append("file", compressedImage);
    const res = await httpClient.post<ArrayBuffer>("/bg-remove", formData, {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "image/png",
      },
    });

    const bgRemovedFile = new File([res.data], file.name);
    setBgRemovedFile(bgRemovedFile);
  };

  const handleMakeSticker = async (
    type: "white" | "black" | "no-bg" | "insta" | "rounded",
  ) => {
    if (!bgRemovedFile || !uploadedFile || !uploadedShapeId) {
      return;
    }

    const shape = editor.getShape<TLImageShape>(uploadedShapeId);
    if (!shape) {
      throw new Error("shape is not found");
    }

    const assetId = shape.props.assetId;
    if (!assetId) {
      throw new Error("assetId is not found");
    }

    const a = editor.getAsset(assetId);
    if (!a) {
      throw new Error("asset is not found");
    }
    const asset = a as TLImageAsset;

    let src = "";
    let w = 0;
    let h = 0;
    switch (type) {
      case "white":
        src = await getImageWithEdge(bgRemovedFile, "white");
        w = asset.props.w;
        h = asset.props.h;
        break;
      case "black":
        src = await getImageWithEdge(bgRemovedFile, "black");
        w = asset.props.w;
        h = asset.props.h;
        break;
      case "no-bg":
        src = await toBase64(bgRemovedFile);
        w = asset.props.w;
        h = asset.props.h;
        break;
      case "insta":
        const result = await getImageWithFrame(uploadedFile, "white");
        src = result.src;
        w = result.w;
        h = result.h;
        break;
      case "rounded":
        src = await getImageRounded(uploadedFile);
        w = asset.props.w;
        h = asset.props.h;
        break;
    }

    const fileData = src.replace(/^data:\w+\/\w+;base64,/, "");
    const decodedFile = Buffer.from(fileData, "base64");
    setEditedFile(new File([decodedFile], "", { type: "image/png" }));

    editor.updateAssets([
      {
        ...asset,
        props: {
          ...asset.props,
          src,
          w,
          h,
        },
      },
    ]);
  };

  const handleDeleteImage = () => {
    if (uploadedShapeId == undefined) {
      throw new Error("uploadedShapeId is not found");
    }
    editor.deleteShapes([uploadedShapeId]);
    setUploadedFile(undefined);
    setUploadedShapeId(undefined);
    setBgRemovedFile(undefined);
    setEditedFile(undefined);
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
    editor.selectNone();
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

    if (editedFile == undefined) {
      throw new Error("editedFile is not found");
    }

    setIsDropLoading(true);
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 1,
        isLocked: false,
      })),
    );

    try {
      const res = await ipfsClient.add({
        path: fileName ?? "",
        content: editedFile,
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

      const previewURI = await getPreviewURL();

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
          canvasOwner,
          `ipfs://${metaRes.cid.toString()}`,
          {
            tokenID: BigInt(0), // Calc in contract
            contractAddress: tokenAddress,
            chainID: BigInt(0), // Get in contract
            srcURI: getIPFSPreviewURL(res.cid.toString()),
            srcName: fileName ?? "",
            mineType: asset.props.mimeType ?? "",
            w: encodeFloat(asset.props.w),
            h: encodeFloat(asset.props.h),
          },
          {
            id: BigInt(shape.meta.onchainShapeId as string),
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
          previewURI,
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
      setBgRemovedFile(undefined);
      setEditedFile(undefined);
      setFileName("");
      setLastSave(editor.store.history.get());
    } catch (e) {
      const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
      editor.updateShapes(
        allShapeIds
          .filter((s) => s != selectedShapeId)
          .map((s) => ({
            id: s,
            type: "image",
            opacity: 0.5,
            isLocked: false,
          })),
      );
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
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds());
    editor.updateShapes(
      allShapeIds.map((s) => ({
        id: s,
        type: "image",
        opacity: 1,
        isLocked: false,
      })),
    );

    try {
      const previewURI = await getPreviewURL();

      const snapshot = editor.store.getSnapshot();

      const stringified = JSON.stringify(snapshot);
      console.log(stringified);

      const shapes = Object.values(snapshot.store).filter(
        (s) => s.typeName == "shape",
      ) as TLImageShape[];

      const assets = Object.values(snapshot.store).filter(
        (s) => s.typeName == "asset",
      ) as TLImageAsset[];

      const formattedAssets = assets.map((a) => {
        const tokenContract = a.meta.tokenContract as {
          collectionAddress: Address;
          chain: number;
        };
        return {
          tokenID: BigInt(a.meta.tokenId?.toString() ?? 0),
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
          id: BigInt(s.meta.onchainShapeId as string),
          x: encodeFloat(s.x),
          y: encodeFloat(s.y),
          rotation: encodeFloat(s.rotation),
          creator: s.meta.creator as Address,
          createdAt: BigInt(s.meta.createdAt as number),
          fid: BigInt(session.user!.id),
          assetID: BigInt(asset.meta.onchainAssetId as string),
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

  const handleBringForward = () => {
    if (selectedShapeId == undefined) {
      return;
    }

    editor.bringForward([selectedShapeId]);
  };

  const handleBringToFront = () => {
    if (selectedShapeId == undefined) {
      return;
    }

    editor.bringToFront([selectedShapeId]);
  };

  const handleSendBackward = () => {
    if (selectedShapeId == undefined) {
      return;
    }

    editor.sendBackward([selectedShapeId]);
  };

  const handleSendToBack = () => {
    if (selectedShapeId == undefined) {
      return;
    }

    editor.sendToBack([selectedShapeId]);
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
      {!!selectedShapeId && (
        <VStack
          pos="absolute"
          top={0}
          bottom={0}
          right={0}
          px={6}
          py={4}
          justify="center"
          spacing={6}
          pointerEvents="all"
        >
          <IconButton
            aria-label=""
            colorScheme="blue"
            rounded="full"
            shadow="xl"
            icon={<Icon as={TbStackFront} />}
            onClick={handleBringToFront}
          />
          <IconButton
            aria-label=""
            colorScheme="blue"
            rounded="full"
            shadow="xl"
            icon={<Icon as={TbStackPop} />}
            onClick={handleBringForward}
          />
          <IconButton
            aria-label=""
            colorScheme="blue"
            rounded="full"
            shadow="xl"
            icon={<Icon as={TbStackPush} />}
            onClick={handleSendBackward}
          />
          <IconButton
            aria-label=""
            colorScheme="blue"
            rounded="full"
            shadow="xl"
            icon={<Icon as={TbStackBack} />}
            onClick={handleSendToBack}
          />
        </VStack>
      )}

      <VStack
        pos="absolute"
        bottom={100}
        left={0}
        right={0}
        px={6}
        py={4}
        justify="center"
      >
        {!!selectedShapeId && !uploadedFile && (
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
            <VStack spacing={6}>
              {isEmojiPickerOpen && (
                <Box pointerEvents="all" ref={emojiPickerRef}>
                  <EmojiPicker onEmojiClick={(s) => setFileName(s.emoji)} />
                </Box>
              )}

              {!!bgRemovedFile && (
                <HStack w="full" spacing={0} pointerEvents="all">
                  <Button
                    variant="unstyled"
                    w="20%"
                    h="full"
                    onClick={() => handleMakeSticker("white")}
                  >
                    <ChakraImage
                      alt="white-sticker"
                      src="/images/stickers/white-sticker.png"
                    />
                  </Button>
                  <Button
                    variant="unstyled"
                    w="20%"
                    h="full"
                    onClick={() => handleMakeSticker("black")}
                  >
                    <ChakraImage
                      alt="black-sticker"
                      src="/images/stickers/black-sticker.png"
                    />
                  </Button>
                  <Button
                    variant="unstyled"
                    w="20%"
                    h="full"
                    onClick={() => handleMakeSticker("no-bg")}
                  >
                    <ChakraImage
                      alt="no-background"
                      src="/images/stickers/no-background.png"
                    />
                  </Button>
                  <Button
                    variant="unstyled"
                    w="20%"
                    h="full"
                    onClick={() => handleMakeSticker("insta")}
                  >
                    <ChakraImage
                      alt="instant-camera"
                      src="/images/stickers/instant-camera.png"
                    />
                  </Button>
                  <Button
                    variant="unstyled"
                    w="20%"
                    h="full"
                    onClick={() => handleMakeSticker("rounded")}
                  >
                    <ChakraImage
                      alt="rounded"
                      src="/images/stickers/rounded.png"
                    />
                  </Button>
                </HStack>
              )}

              <HStack>
                <IconButton
                  aria-label="close image"
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
                <Input
                  value={fileName}
                  pointerEvents="all"
                  isReadOnly={true}
                  w={16}
                  onClick={() => setIsEmojiPickerOpen(true)}
                  textAlign="center"
                />
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
          <DrawerBody>
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
                    <ChakraImage
                      src={token.image?.url ?? ""}
                      alt={token.name ?? ""}
                    />
                  </Button>
                </GridItem>
              ))}
            </SimpleGrid>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
});
