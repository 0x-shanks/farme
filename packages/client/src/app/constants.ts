import { Address, parseEther } from 'viem';
import { zora, zoraSepolia } from 'viem/chains';

export const isMainnet = process.env.NEXT_PUBLIC_IS_MAINNNET == 'true';
export const defaultChain = isMainnet ? zora : zoraSepolia;
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

export const siteDomain = siteOrigin.split('://')[1];

export const maxErrorReason = 40;
export const appFid = 489899;

export const privacyPolicyLink =
  'https://furtive-newt-212.notion.site/Privacy-Policy-65f021f27e3744fc9e70af4c12405ae4';
export const termsLink = '';
