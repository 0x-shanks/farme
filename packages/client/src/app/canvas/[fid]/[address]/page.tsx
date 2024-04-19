"use client";

import {
  IndexKey,
  StoreSnapshot,
  TLAsset,
  TLAssetId,
  TLImageAsset,
  TLImageShape,
  TLParentId,
  TLRecord,
  TLShapeId,
  TLStore,
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
  Tag,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { PiSticker } from "react-icons/pi";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { LuSave } from "react-icons/lu";
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { ZDKChain, ZDKNetwork } from "@zoralabs/zdk";
import { base, baseSepolia, zoraSepolia } from "viem/chains";
import {
  Token,
  TokenContract,
  TokenContentMedia,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { addDays, getUnixTime } from "date-fns";
import { canvasAbi } from "@/utils/contract/generated";
import { canvasAddress, tokenAddress } from "@/utils/contract/address";
import {
  getClient,
  getWalletClient,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  Address,
  Chain,
  createPublicClient,
  decodeEventLog,
  encodePacked,
  fromHex,
  http,
  keccak256,
  toHex,
  zeroAddress,
} from "viem";
import {
  createMintClient,
  getDefaultFixedPriceMinterAddress,
} from "@zoralabs/protocol-sdk";

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
import { LiaUndoAltSolid, LiaRedoAltSolid } from "react-icons/lia";

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
import { AddStickerIcon } from "@/components/icons/AddStickerIcon";
import { TokenDetailResponse } from "@/models/tokenDetailResponse";
import { formatAddress } from "@/utils/address";
import Countdown from "react-countdown";
import { getChain } from "@/utils/chain";
import { wagmiConfig } from "@/app/provider";
import { kv } from "@vercel/kv";
import { CreateBgRemovedCidRequest } from "@/models/createBgRemovedCidRequest";
import { BgRemovedCidResponse } from "@/models/bgRemovedCidResponse";
import { vibur } from "@/app/fonts";
import { getChainNameShorthand, getDomainFromChain } from "@/utils/zora/chain";
import Link from "next/link";

export default function Home({
  params,
}: {
  params: { address: Address; fid: number };
}) {
  const customTools = [MobileSelectTool];

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
          <Tldraw hideUi tools={customTools}>
            <Canvas canvasOwner={params.address} fid={params.fid} />
          </Tldraw>
        </Box>
      </Box>
    </main>
  );
}

const Canvas = track(
  ({ canvasOwner, fid }: { canvasOwner: Address; fid: number }) => {
    const editor = useEditor();
    const { address } = useAccount();
    const { data: session } = useSession();
    const config = useConfig();
    const router = useRouter();

    editor.setCurrentTool("mobileSelect");

    // States
    const [lastSave, setLastSave] = useState<string>();
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
    const [shouldShowDrop, setShouldShowDrop] = useState<boolean>(false);
    const [mintTokenDetail, setMintTokenDetail] =
      useState<TokenDetailResponse>();
    const [farcasterUser, setFarcasterUser] = useState<UserResponseItem>();
    const onceUserFetch = useRef();

    const {
      isOpen: isStickerOpen,
      onOpen: onStickerOpen,
      onClose: onStickerClose,
    } = useDisclosure();

    const {
      isOpen: isMintStickerOpen,
      onOpen: onMintStickerOpen,
      onClose: onMintStickerClose,
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

    const selectedAsset = useMemo(() => {
      const assetId = selectedShape?.props.assetId;
      if (!assetId) {
        return undefined;
      }

      const a = editor.getAsset(assetId);
      if (!a) {
        return undefined;
      }
      const asset = a as TLImageAsset;
      return asset;
    }, [selectedShape?.props.assetId]);

    const OpacityRegex = /"opacity":\s*(\d+(\.\d+)?),/g;
    const IsLockedRegex = /"isLocked":\s*(true|false),/g;
    const assetKeyRegex = /asset:\d+/g;
    const shapeKeyRegex = /shape:\d+/g;
    const removeUnusedAssets = (data: string) => {
      const parsedData = JSON.parse(data) as StoreSnapshot<TLRecord>;
      const assetKeys = Object.keys(parsedData.store).filter(
        (k) => k.match(assetKeyRegex) as string[],
      );
      const shapeKeys = Object.keys(parsedData.store).filter((k) =>
        k.match(shapeKeyRegex),
      ) as string[];
      const unusedAssetKey = assetKeys.filter(
        (ak) => shapeKeys.indexOf(ak) == -1,
      );

      const dataWithoutAssetValues = { ...parsedData };
      unusedAssetKey.forEach((key) => {
        delete dataWithoutAssetValues.store[key as any];
      });
      return dataWithoutAssetValues;
    };

    const isChangeCanvas = useMemo(() => {
      if (!address) {
        return false;
      }

      if (!lastSave) {
        return false;
      }

      const last = JSON.stringify(removeUnusedAssets(lastSave))
        .replaceAll(OpacityRegex, "")
        .replaceAll(IsLockedRegex, "");

      const current = JSON.stringify(
        removeUnusedAssets(JSON.stringify(editor.store.getSnapshot())),
      )
        .replaceAll(OpacityRegex, "")
        .replaceAll(IsLockedRegex, "");

      return last != current;
    }, [address, editor.store.getSnapshot(), lastSave]);

    // Load canvas
    useEffect(() => {
      if (!canvasAddress || !address) {
        return;
      }
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
                mimeType: asset.mimeType,
                isAnimated: asset.mimeType == "image/gif",
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

        setLastSave(JSON.stringify(editor.store.getSnapshot()));
        editor.mark("latest");
      }
    }, [canvasData, isCanvasFetched, canvasOwner, address]);

    // Fetch zora tokens
    const fetchTokens = async () => {
      const res = await httpClient.get<TokensResponse>(
        `/zora/tokens/${address}`,
      );
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
      if (
        entry.changes.updated.hasOwnProperty("instance_page_state:page:page")
      ) {
        const updatedEntry =
          //@ts-ignore
          entry.changes.updated["instance_page_state:page:page"];

        if (!updatedEntry || updatedEntry.length < 2) {
          return;
        }

        if (
          updatedEntry[1].hasOwnProperty("selectedShapeIds") &&
          updatedEntry[1].selectedShapeIds[0] != selectedShapeId
        ) {
          setSelectedShapeId(updatedEntry[1].selectedShapeIds[0]);
        } else if (
          updatedEntry[1].hasOwnProperty("hoveredShapeId") &&
          updatedEntry[1].hoveredShapeId != selectedShapeId
        ) {
          setSelectedShapeId(updatedEntry[1].hoveredShapeId ?? undefined);
        }
      }
    });
    useEffect(() => {
      if (uploadedFile) {
        return;
      }

      if (selectedShapeId == undefined) {
        setUploadedFile(undefined);
        setUploadedShapeId(undefined);
        setBgRemovedFile(undefined);
        setEditedFile(undefined);
        setFileName("");
      }

      const allShapeIds = Array.from(editor.getCurrentPageShapeIds());

      if (selectedShapeId) {
        const filtered = allShapeIds.filter(
          (s) => s.toString() != selectedShapeId,
        );
        editor.updateShapes(
          filtered.map((s) => {
            return {
              id: s,
              type: "image",
              opacity: 0.5,
              isLocked: true,
            };
          }),
        );
      } else {
        editor.updateShapes(
          allShapeIds.map((s) => {
            const shape = editor.getShape(s);
            return {
              id: s,
              type: "image",
              opacity: 1,
              isLocked:
                shape?.meta.creator != address && canvasOwner != address,
            };
          }),
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

    // Fetch user farcaster data
    useEffect(() => {
      (async () => {
        const res = await httpClient.get<UserResponse>(`/farcaster/${fid}`);
        setFarcasterUser(res.data.user);
      })();
    }, [onceUserFetch]);

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

        const res = await ipfsClient.add(
          {
            content: compressedImage,
            path: canvasOwner,
          },
          { cidVersion: 1 },
        );

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

    const getAssetToken = (asset: TLAsset) => {
      const tokenContract = asset.meta?.tokenContract as
        | TokenContract
        | undefined;
      const contractAddress = tokenContract?.collectionAddress;
      const chainId = tokenContract?.chain;
      const tokenId = asset.meta?.tokenId;
      return { contractAddress, chainId, tokenId };
    };

    const updateBgRemoveFile = async (file: File, compressed: File) => {
      const cidRes = await ipfsClient.add(
        {
          content: file,
          path: "",
        },
        { cidVersion: 1, onlyHash: true },
      );

      console.log(cidRes.cid.toString());

      const cacheRes = await httpClient.get<BgRemovedCidResponse>(
        `/cache/bg-remove/${cidRes.cid.toString()}`,
      );
      if (cacheRes.data.cid != "") {
        console.log("cache hit");
        const url = getIPFSPreviewURL(cacheRes.data.cid);
        try {
          const imageRes = await fetch(url);
          console.log(imageRes);
          const imageData = await imageRes.arrayBuffer();

          const bgRemovedFile = new File([imageData], file.name);
          setBgRemovedFile(bgRemovedFile);
        } catch (e) {}
      } else {
        console.log("no cache");
        const formData = new FormData();
        formData.append("file", compressed);
        const bgRemovedRes = await httpClient.post<ArrayBuffer>(
          "/bg-remove",
          formData,
          {
            responseType: "arraybuffer",
            headers: {
              "Content-Type": "image/png",
            },
          },
        );

        const bgRemovedFile = new File([bgRemovedRes.data], file.name);
        setBgRemovedFile(bgRemovedFile);

        const bgRemovedIPFSRes = await ipfsClient.add(
          {
            content: bgRemovedFile,
            path: "",
          },
          { cidVersion: 1 },
        );

        const cacheReq: CreateBgRemovedCidRequest = {
          bgRemovedCid: bgRemovedIPFSRes.cid.toString(),
        };
        await httpClient.post(
          `/cache/bg-remove/${cidRes.cid.toString()}`,
          cacheReq,
        );
        console.log(cidRes.cid.toString(), bgRemovedIPFSRes.cid.toString());
      }
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

      const compressedImage = await imageCompression(file, {
        maxWidthOrHeight: 1000,
      });
      setUploadedFile(compressedImage);

      await editor.putExternalContent({
        type: "files",
        files: [compressedImage],
        point: editor.getViewportPageBounds().center,
        ignoreParent: false,
      });

      const shapeId = editor.getSelectedShapeIds()[0];
      const shape = editor.getShape<TLImageShape>(shapeId);

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

      setUploadedShapeId(shapeId);
      setFileName("😃");

      onStickerClose();
      await updateBgRemoveFile(file, compressedImage);
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
      setShouldShowDrop(true);

      await editor.putExternalContent({
        type: "files",
        files: [compressedImage],
        point: editor.getViewportPageBounds().center,
        ignoreParent: false,
      });

      const shapeId = editor.getSelectedShapeIds()[0];
      const shape = editor.getShape<TLImageShape>(shapeId);

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

      setUploadedShapeId(shapeId);
      setFileName("😃");

      await updateBgRemoveFile(file, compressedImage);
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
      setShouldShowDrop(true);
    };

    const handleDeleteInsertedImage = () => {
      if (uploadedShapeId == undefined) {
        throw new Error("uploadedShapeId is not found");
      }
      editor.deleteShape(uploadedShapeId);
      setUploadedFile(undefined);
      setUploadedShapeId(undefined);
      setBgRemovedFile(undefined);
      setEditedFile(undefined);
      setSelectedShapeId(undefined);
      setFileName("");
      setShouldShowDrop(false);
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
        const res = await ipfsClient.add(
          {
            path: fileName ?? "",
            content: editedFile,
          },
          { cidVersion: 1 },
        );

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
              mimeType: asset.props.mimeType ?? "",
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

        let tokenId = 0;

        receipt.logs.forEach((l) => {
          try {
            const decoded = decodeEventLog({
              abi: canvasAbi,
              data: l.data,
              topics: l.topics,
            });
            if (decoded.eventName == "CreateSticker") {
              tokenId = Number(decoded.args.id);
            }
          } catch (e) {}
        });

        if (tokenId == 0) {
          throw new Error("tokenId is not found");
        }

        const tokenContract: TokenContract = {
          chain: zoraSepolia.id,
          network: ZDKNetwork.Zora,
          collectionAddress: tokenAddress,
        };

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
        setLastSave(JSON.stringify(editor.store.getSnapshot()));
        editor.mark("latest");
        setShouldShowDrop(false);
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
            mimeType: a.props.mimeType ?? "",
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
        setLastSave(JSON.stringify(editor.store.getSnapshot()));
        editor.mark("latest");
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

    const handleDeleteImage = () => {
      if (selectedShapeId == undefined) {
        return;
      }

      editor.deleteShape(selectedShapeId as TLShapeId);
      setUploadedFile(undefined);
      setUploadedShapeId(undefined);
      setBgRemovedFile(undefined);
      setEditedFile(undefined);
      setSelectedShapeId(undefined);
      setFileName("");
      setShouldShowDrop(false);
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

    const handleUndo = () => {
      if (editor.history.getNumUndos() == 0) {
        return;
      }
      editor.history.undo();
    };

    const handleRedo = () => {
      if (editor.history.getNumRedos() == 0) {
        return;
      }
      editor.history.redo();
    };

    const stickerUrl = useMemo(() => {
      if (!selectedAsset) {
        return undefined;
      }

      const { contractAddress, chainId, tokenId } =
        getAssetToken(selectedAsset);

      if (!contractAddress || !tokenId || !chainId) {
        return undefined;
      }

      const domain = getDomainFromChain(chainId);
      const shortChainName = getChainNameShorthand(chainId);

      return `https://${domain}/collect/${shortChainName}:${contractAddress.toLowerCase()}/${tokenId}`;
    }, [selectedAsset]);

    const handleOpenMintStickerModal = async () => {
      // TODO: fix api
      // onMintStickerOpen();
      // if (!selectedAsset) {
      //   throw new Error("selectedAsset is not found");
      // }
      // const { contractAddress, chainId, tokenId } =
      //   getAssetToken(selectedAsset);
      // if (!contractAddress || !tokenId || !chainId) {
      //   throw new Error("contractAddress or tokenId or chainId is invalid");
      // }
      // if (contractAddress && tokenId) {
      //   const res = await httpClient.get<TokenDetailResponse>(
      //     `/zora/tokens/${contractAddress}/${tokenId}?chain=${chainId}`,
      //   );
      //   setMintTokenDetail(res.data);
      // }
    };

    const handleCloseMintStickerModal = () => {
      onMintStickerClose();
      setMintTokenDetail(undefined);
    };

    const [isMintingSticker, setIsMintingSticker] = useState<boolean>(false);
    const [mintComment, setMintComment] = useState<string>("");

    const handleMintSticker = async () => {
      if (!address) {
        throw new Error("address is not found");
      }
      if (!selectedAsset) {
        throw new Error("selectedAsset is not found");
      }
      const { contractAddress, chainId, tokenId } =
        getAssetToken(selectedAsset);
      if (!contractAddress || !tokenId || !chainId) {
        throw new Error("contractAddress or tokenId or chain is invalid");
      }
      const chain = getChain(chainId);
      if (chain == undefined) {
        throw new Error("chain is invalid");
      }

      setIsMintingSticker(true);

      try {
        const mintClient = createMintClient({ chain: chain });

        const prepared = await mintClient.makePrepareMintTokenParams({
          tokenAddress: contractAddress as Address,
          tokenId,
          mintArguments: {
            mintToAddress: address,
            quantityToMint: 1,
            mintComment,
            mintReferral: canvasOwner,
          },
          minterAccount: address,
        });

        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        const walletClient = await getWalletClient(wagmiConfig, {
          chainId,
        });

        const { request } = await publicClient.simulateContract(prepared);

        const txHash = await walletClient.writeContract(request);

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        setMintComment("");
      } catch (e) {
        // TODO: handle error
        console.error(e);
      } finally {
        setIsMintingSticker(false);
      }
    };

    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const shouldSwitchNetworkMint = useMemo(() => {
      if (!selectedAsset) {
        return undefined;
      }
      const { chainId: cid } = getAssetToken(selectedAsset);
      if (!cid) {
        return undefined;
      }
      return chainId != cid;
    }, [chainId, selectedAsset]);

    const handleSwitchChainMint = () => {
      if (!selectedAsset) {
        throw new Error("selectedAsset is not found");
      }
      const { chainId: cid } = getAssetToken(selectedAsset);
      if (!cid) {
        throw new Error("chainId is invalid");
      }
      switchChain({ chainId: cid });
    };

    const shouldSwitchNetworkDrop = useMemo(() => {
      // TODO: mainnet
      return chainId != zoraSepolia.id;
    }, [chainId]);

    const handleSwitchChainDrop = () => {
      switchChain({ chainId: zoraSepolia.id });
    };

    const handleReset = () => {
      editor.bailToMark("latest");
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
        {isChangeCanvas && (
          <VStack
            pos="absolute"
            bottom={56}
            right={0}
            px={6}
            py={4}
            justify="center"
            spacing={4}
            pointerEvents="all"
          >
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={LiaUndoAltSolid} />}
              onClick={handleUndo}
              isDisabled={editor.history.getNumUndos() == 0}
            />
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={LiaRedoAltSolid} />}
              onClick={handleRedo}
              isDisabled={editor.history.getNumRedos() == 0}
            />
          </VStack>
        )}
        {!!selectedShapeId && !selectedShape?.isLocked && (
          <VStack
            pos="absolute"
            top={0}
            right={0}
            px={6}
            py={4}
            justify="center"
            spacing={4}
            pointerEvents="all"
          >
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={TbStackFront} />}
              onClick={handleBringToFront}
            />
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={TbStackPop} />}
              onClick={handleBringForward}
            />
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={TbStackPush} />}
              onClick={handleSendBackward}
            />
            <IconButton
              aria-label=""
              colorScheme="primary"
              rounded="full"
              shadow="xl"
              icon={<Icon as={TbStackBack} />}
              onClick={handleSendToBack}
            />
          </VStack>
        )}

        <HStack
          pos="absolute"
          top={10}
          left={0}
          right={0}
          w="full"
          justify="center"
          spacing={3}
        >
          <Avatar
            src={farcasterUser?.pfp ?? ""}
            shadow="xl"
            borderWidth={2}
            borderColor="white"
          />
          <Box w={28}>
            {!!farcasterUser ? (
              <>
                <Text
                  fontWeight={600}
                  textAlign="start"
                  w="full"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                >
                  {farcasterUser.displayName}
                </Text>
                <Text
                  textColor="gray"
                  fontSize="small"
                  textAlign="start"
                  w="full"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  overflow="hidden"
                >{`@${farcasterUser?.userName}`}</Text>
              </>
            ) : (
              <>
                <SkeletonText noOfLines={2} w="full" />
              </>
            )}
          </Box>
        </HStack>

        <VStack pos="absolute" bottom={8} left={0} right={0} w="full">
          <VStack px={6} py={4} justify="center" w="full">
            {!!selectedShapeId && !editedFile && (
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

          {isEmojiPickerOpen && (
            <Box pointerEvents="all" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={(s) => setFileName(s.emoji)} />
            </Box>
          )}

          {!!selectedShapeId && uploadedShapeId == selectedShapeId && (
            <HStack w="full" spacing={3} pointerEvents="all" justify="center">
              <Button
                variant="unstyled"
                w="15%"
                h="full"
                onClick={() => handleMakeSticker("white")}
                isDisabled={!bgRemovedFile}
              >
                <ChakraImage
                  alt="white-sticker"
                  src="/images/stickers/white-sticker.png"
                />
              </Button>
              <Button
                variant="unstyled"
                w="15%"
                h="full"
                onClick={() => handleMakeSticker("black")}
                isDisabled={!bgRemovedFile}
              >
                <ChakraImage
                  alt="black-sticker"
                  src="/images/stickers/black-sticker.png"
                />
              </Button>
              <Button
                variant="unstyled"
                w="15%"
                h="full"
                onClick={() => handleMakeSticker("no-bg")}
                isDisabled={!bgRemovedFile}
              >
                <ChakraImage
                  alt="no-background"
                  src="/images/stickers/no-background.png"
                />
              </Button>
              <Button
                variant="unstyled"
                w="15%"
                h="full"
                onClick={() => handleMakeSticker("insta")}
                isDisabled={!bgRemovedFile}
              >
                <ChakraImage
                  alt="instant-camera"
                  src="/images/stickers/instant-camera.png"
                />
              </Button>
              <Button
                variant="unstyled"
                w="15%"
                h="full"
                onClick={() => handleMakeSticker("rounded")}
                isDisabled={!bgRemovedFile}
              >
                <ChakraImage alt="rounded" src="/images/stickers/rounded.png" />
              </Button>
            </HStack>
          )}
          <HStack px={6} py={4} justify="space-between" w="full">
            {shouldShowDrop ? (
              <>
                <Spacer />
                <VStack spacing={6} w="full">
                  <HStack w="full" alignItems="end">
                    <IconButton
                      aria-label="close image"
                      icon={<Icon as={IoMdClose} />}
                      colorScheme="gray"
                      rounded="full"
                      shadow="xl"
                      pointerEvents="all"
                      onClick={handleDeleteInsertedImage}
                      size="lg"
                    />

                    {shouldSwitchNetworkDrop ? (
                      <Button
                        pointerEvents="all"
                        colorScheme="primary"
                        shadow="xl"
                        rounded="full"
                        size="lg"
                        w="full"
                        onClick={handleSwitchChainDrop}
                      >
                        Change Network
                      </Button>
                    ) : (
                      <Button
                        pointerEvents="all"
                        colorScheme="primary"
                        shadow="xl"
                        rounded="full"
                        size="lg"
                        w="full"
                        onClick={handleDrop}
                        isLoading={isDropLoading}
                      >
                        Drop
                      </Button>
                    )}

                    <VStack spacing={1}>
                      <Text fontSize="xs">Symbol</Text>
                      <Button
                        pointerEvents="all"
                        onClick={() => setIsEmojiPickerOpen(true)}
                        textAlign="center"
                        rounded="full"
                        colorScheme="primary"
                      >
                        {fileName}
                      </Button>
                    </VStack>
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
                    colorScheme="primary"
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
                      colorScheme="primary"
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

                  {selectedShapeId && !selectedShape?.isLocked && (
                    <IconButton
                      aria-label="delete"
                      icon={<Icon as={GoTrash} />}
                      colorScheme="primary"
                      rounded="full"
                      shadow="xl"
                      pointerEvents="all"
                      size="lg"
                      onClick={handleDeleteImage}
                    />
                  )}

                  {selectedShapeId && selectedShape?.isLocked && (
                    <Box
                      pointerEvents={stickerUrl == undefined ? "none" : "all"}
                    >
                      <Link
                        href={stickerUrl ?? ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconButton
                          aria-label="mint-sticker"
                          icon={<Icon as={AddStickerIcon} />}
                          colorScheme="primary"
                          rounded="full"
                          shadow="xl"
                          pointerEvents="all"
                          size="lg"
                          onClick={handleOpenMintStickerModal}
                          isDisabled={stickerUrl == undefined}
                        />
                      </Link>
                    </Box>
                  )}
                </HStack>
                <HStack>
                  {isChangeCanvas ? (
                    <>
                      <IconButton
                        aria-label="save"
                        icon={<Icon as={IoMdClose} />}
                        colorScheme="gray"
                        rounded="full"
                        shadow="xl"
                        pointerEvents="all"
                        size="lg"
                        onClick={handleReset}
                      />
                      <IconButton
                        aria-label="save"
                        icon={<Icon as={isSavedSuccess ? FaCheck : LuSave} />}
                        colorScheme="primary"
                        rounded="full"
                        shadow="xl"
                        pointerEvents="all"
                        size="lg"
                        onClick={handleSave}
                        isLoading={isSaveLoading}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        aria-label="save"
                        icon={<Icon as={IoIosArrowBack} />}
                        colorScheme="primary"
                        rounded="full"
                        shadow="xl"
                        pointerEvents="all"
                        size="lg"
                        onClick={handleBack}
                      />
                    </>
                  )}
                </HStack>
              </>
            )}
          </HStack>
        </VStack>

        <Drawer
          placement="bottom"
          onClose={onStickerClose}
          isOpen={isStickerOpen}
          size="full"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <Text className={vibur.className} fontSize="4xl">
                Sticker
              </Text>
            </DrawerHeader>
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

        <Drawer
          placement="bottom"
          onClose={handleCloseMintStickerModal}
          isOpen={isMintStickerOpen}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <VStack w="full" mt={12} mb={8}>
                <HStack justify="space-between" w="full">
                  <Text>First minter</Text>
                  {mintTokenDetail == undefined ? (
                    <SkeletonText noOfLines={1} w={20} />
                  ) : (
                    <Text>
                      {mintTokenDetail.contractSummary.first_minter.ens_name ??
                        formatAddress(
                          mintTokenDetail.contractSummary.first_minter.address,
                        )}
                    </Text>
                  )}
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text>Top minter</Text>
                  {mintTokenDetail == undefined ? (
                    <SkeletonText noOfLines={1} w={20} />
                  ) : (
                    <HStack>
                      <Text>
                        {mintTokenDetail.contractSummary.top_minter.minter
                          .ens_name ??
                          formatAddress(
                            mintTokenDetail.contractSummary.top_minter.minter
                              .address,
                          )}
                      </Text>
                      <Tag colorScheme="primary">{`x${mintTokenDetail.contractSummary.top_minter.count}`}</Tag>
                    </HStack>
                  )}
                </HStack>
                <HStack justify="space-between" w="full" mb={8}>
                  <Text>Creator earning</Text>
                  {mintTokenDetail == undefined ? (
                    <SkeletonText noOfLines={1} w={20} />
                  ) : (
                    <Text>
                      {`${mintTokenDetail.contractSummary.creator_earnings.decimal}${mintTokenDetail.contractSummary.creator_earnings.currency.name}`}
                    </Text>
                  )}
                </HStack>
                <Input
                  onChange={(e) => setMintComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                {shouldSwitchNetworkMint ? (
                  <Button
                    w="full"
                    colorScheme="primary"
                    rounded="full"
                    isDisabled={shouldSwitchNetworkMint == undefined}
                    isLoading={shouldSwitchNetworkMint == undefined}
                    onClick={handleSwitchChainMint}
                  >
                    Change Network
                  </Button>
                ) : (
                  <Button
                    w="full"
                    colorScheme="primary"
                    rounded="full"
                    isDisabled={
                      mintTokenDetail?.sales.fixedPrice.state != "STARTED"
                    }
                    isLoading={isMintingSticker}
                    onClick={handleMintSticker}
                  >
                    Mint
                  </Button>
                )}

                {mintTokenDetail == undefined ? (
                  <SkeletonText noOfLines={1} w={60} />
                ) : (
                  <HStack>
                    <Text>{`${mintTokenDetail?.contractSummary.mint_count} minted`}</Text>
                    <Countdown
                      date={fromUnixTime(
                        mintTokenDetail.sales.fixedPrice.end / 1000,
                      )}
                      renderer={({
                        days,
                        hours,
                        minutes,
                        seconds,
                        completed,
                      }) => {
                        if (completed) {
                          return <Text>・The mintable period has ended</Text>;
                        } else {
                          return (
                            <Text>
                              ・{days}d {hours}h {minutes}m {seconds}s
                            </Text>
                          );
                        }
                      }}
                    />
                  </HStack>
                )}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    );
  },
);
