import { Address } from "viem";
import { base, zoraSepolia } from "wagmi/chains";

export const defaultChain =
  process.env.NEXT_PUBLIC_IS_MAINNNET == "true" ? base : zoraSepolia;
export const supportedChains = [defaultChain];

export const farcasterHubURL =
  process.env.NEXT_PUBLIC_FARCASTER_HUB_ENDPOINT ?? "nemes.farcaster.xyz:2283";

export const createReferral = process.env
  .NEXT_PUBLIC_CREATE_REFERRAL as Address;
