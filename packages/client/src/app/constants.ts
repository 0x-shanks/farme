import { Address, parseEther } from 'viem';
import { zora, zoraSepolia } from 'viem/chains';

export const defaultChain =
  process.env.NEXT_PUBLIC_IS_MAINNNET == 'true' ? zora : zoraSepolia;
export const supportedChains = [defaultChain];

export const farcasterHubURL =
  process.env.NEXT_PUBLIC_FARCASTER_HUB_ENDPOINT ?? 'hub-grpc.pinata.cloud';

// NOTE: must be EOA
export const createReferral = process.env
  .NEXT_PUBLIC_CREATE_REFERRAL as Address;

export const feeTaker = process.env.NEXT_PUBLIC_FEE_TAKER as Address;
export const fee = parseEther('0.000777');

export const siteOrigin =
  process.env.NEXT_PUBLIC_ORIGIN ||
  process.env.VERCEL_URL ||
  'http://localhost:8000';
