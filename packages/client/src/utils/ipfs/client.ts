import { create as createKubo } from "kubo-rpc-client";

export const ipfsClient = createKubo({
  url: "https://ipfs-uploader.zora.co/api/v0",
});
