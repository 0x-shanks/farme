export const getIPFSPreviewURL = (cid: string) => {
  return `https://ipfs.decentralized-content.com/ipfs/${cid}`;
  // return new URL(
  //   `https://remote-image.decentralized-content.com/image?${new URLSearchParams(
  //     {
  //       url: `https://ipfs-gateway-dev.zoralabs.workers.dev/ipfs/${cid}`,
  //       w: "3840",
  //       q: "75",
  //     },
  //   ).toString()}`,
  // ).toString();
};
