import { Config, removeBackground } from "@imgly/background-removal-node";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
import { Writable } from "node:stream";
import { Buffer } from "node:buffer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endBuffers: Buffer[] = [];
  const form = formidable({
    fileWriteStreamHandler: (file) => {
      let chunks: Uint8Array[] = [];

      const writable = new Writable({
        write(chunk, enc, next) {
          chunks.push(chunk);
          next();
        },
        destroy() {
          chunks = [];
        },
        final(cb) {
          const buffer = Buffer.concat(chunks);
          endBuffers.push(buffer);
          cb();
        },
      });
      return writable;
    },
  });

  const getFile = new Promise<{ mineType: string | null; err: Error }>(
    (resolve, reject) => {
      form.parse(req, (err, _, files) => {
        const imageFiles = files.file;
        if (imageFiles && imageFiles[0]) {
          resolve({
            mineType: imageFiles[0].mimetype,
            err,
          });
        }
        reject(new Error("invalid image"));
      });
    },
  );

  const { mineType, err } = await getFile;
  if (err) {
    res.status(500).json({ message: err.message });
    return;
  }
  if (!mineType) {
    res.status(500).json({ message: "cannot get mineType" });
    return;
  }

  if (!endBuffers[0]) {
    res.status(400).json({ message: "not found file" });
    return;
  }

  const config: Config = {
    debug: false,
    output: {
      quality: 0.8,
      format: "image/png",
    },
  };

  const blob = new Blob([endBuffers[0]], { type: mineType });

  const removedBlob = await removeBackground(blob, config);

  const buffer = await removedBlob.arrayBuffer();
  const nodeBuffer = Buffer.from(buffer);
  res.status(200).send(nodeBuffer);
}
