export const getIPFSPreviewURL = (cid: string) => {
  return `https://magic.decentralized-content.com/ipfs/${cid}`;
  // return new URL(
  //   `https://remote-image.decentralized-content.com/image?${new URLSearchParams(
  //     {
  //       url: `https://magic.decentralized-content.com/ipfs/${cid}`,
  //       w: "1920",
  //       q: "75",
  //     }
  //   ).toString()}`
  // ).toString();
};
