import { base, baseSepolia } from "wagmi/chains";

export const defaultChain =
  process.env.NEXT_PUBLIC_IS_MAINNNET == "true" ? base : baseSepolia;
export const supportedChains = [defaultChain];

export const farcasterHubURL =
  process.env.NEXT_PUBLIC_FARCASTER_HUB_ENDPOINT ?? "nemes.farcaster.xyz:2283";
