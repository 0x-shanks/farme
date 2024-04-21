import { farcasterHubURL } from '@/app/constants';
import { getSSLHubRpcClient } from '@farcaster/hub-nodejs';

export const farcasterHubClient = getSSLHubRpcClient(farcasterHubURL);
