import express from 'express';
import { Config, removeBackground } from "@imgly/background-removal-node";
import formidable from "formidable";
import { Writable } from "stream";
import { Buffer } from "buffer";

const app = express();

app.post('/api/remove-background', async (req, res) => {
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

  const getFile = new Promise<{ mimeType: string | null; err: Error }>(
    (resolve, reject) => {
      form.parse(req, (err, _, files) => {
        const imageFiles = files.file;
        if (imageFiles && imageFiles[0]) {
          resolve({
            mimeType: imageFiles[0].mimetype,
            err,
          });
        }
        reject(new Error("invalid image"));
      });
    },
  );

  const { mimeType, err } = await getFile;
  if (err) {
    res.status(500).json({ message: err.message });
    return;
  }
  if (!mimeType) {
    res.status(500).json({ message: "cannot get mimeType" });
    return;
  }

  if (!endBuffers[0]) {
    res.status(400).json({ message: "not found file" });
    return;
  }

  const publicPath = `http://localhost:8001/public/`

  const config: Config = {
    debug: false,
    output: {
      quality: 0.8,
      format: "image/png",
    },
    publicPath,
    model: "small",
  };

  const blob = new Blob([endBuffers[0]], { type: mimeType });

  const removedBlob = await removeBackground(blob, config);

  const buffer = await removedBlob.arrayBuffer();
  const nodeBuffer = Buffer.from(buffer);
  res.status(200).send(nodeBuffer);
});

app.use('/public', express.static('public'));

app.listen(8001, () => {
  console.log("サーバー起動中");
});