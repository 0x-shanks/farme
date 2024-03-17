"use client";

import {
  AssetRecordType,
  TLImageShape,
  Tldraw,
  track,
  useActions,
  useEditor,
} from "tldraw";
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { PiSticker } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { LuSave } from "react-icons/lu";
import { create as createKubo } from "kubo-rpc-client";

export default function Home() {
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
  const [uploadedFile, setUploadedFile] = useState<File>();
  const [selectedShapeId, setSelectedShapeId] = useState<string>();

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
    console.log(editor.getCurrentPageShapes());

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

    setSelectedShapeId(editor.getSelectedShapeIds()[0]);
  };

  const handleDeleteImage = () => {
    editor.deleteShapes(editor.getSelectedShapeIds());
    setUploadedFile(undefined);
    setSelectedShapeId(undefined);
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
    const res = await kubo.add({
      path: uploadedFile?.name ?? "",
      content: uploadedFile,
    });

    const url = `https://ipfs.io/ipfs/${res.cid.toString()}`;

    // TODO: fix
    const contractAddress = "0xabcdefg";
    const id = 1;

    const shape = editor.getShape<TLImageShape>(
      editor.getSelectedShapeIds()[0]
    );

    if (!shape) {
      throw new Error("shape is not found");
    }

    editor.updateShape({
      ...shape,
      meta: {
        contractAddress,
        id,
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
    setSelectedShapeId(undefined);
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
    </Box>
  );
});
