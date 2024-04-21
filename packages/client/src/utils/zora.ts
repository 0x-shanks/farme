import { ZDK, ZDKNetwork } from '@zoralabs/zdk';
import { Chain } from '@zoralabs/zdk/dist/queries/queries-sdk';

const API_ENDPOINT = 'https://api.zora.co/graphql';
const args = {
  endPoint: API_ENDPOINT,
  networks: [
    {
      network: ZDKNetwork.Zora,
      chain: 'ZORA_SEPOLIA' as Chain
    }
  ],
  apiKey: process.env.ZORA_API_KEY
};
export const zdk = new ZDK(args);
