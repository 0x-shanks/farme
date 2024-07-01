import { farcasterHubReadURL, farcasterHubWriteURL } from '@/app/constants';
import { getSSLHubRpcClient, HubRpcClient } from '@farcaster/hub-nodejs';

type Client = {
  read: HubRpcClient;
  write: HubRpcClient;
};

export const farcasterHubClient: Client = {
  read: getSSLHubRpcClient(farcasterHubReadURL),
  write: getSSLHubRpcClient(farcasterHubWriteURL)
};
