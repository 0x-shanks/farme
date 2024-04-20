import { Address } from "viem";
import { zora, zoraSepolia } from "viem/chains";

export const defaultChain =
  process.env.NEXT_PUBLIC_IS_MAINNNET == "true" ? zora : zoraSepolia;
export const supportedChains = [defaultChain];

export const farcasterHubURL =
  process.env.NEXT_PUBLIC_FARCASTER_HUB_ENDPOINT ?? "hub-grpc.pinata.cloud";

export const createReferral = process.env
  .NEXT_PUBLIC_CREATE_REFERRAL as Address;
