import { base, baseSepolia } from "wagmi/chains";

export const defaultChain =
  process.env.NEXT_PUBLIC_IS_MAINNNET == "true" ? base : baseSepolia;
export const supportedChains = [defaultChain];
