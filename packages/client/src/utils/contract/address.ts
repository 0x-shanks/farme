import { Address } from 'viem';
import testnet from './testnet.json';
import mainnet from './mainnet.json';
import { isMainnet } from '../../app/constants';

export const canvasAddress = isMainnet
  ? (mainnet.transactions[1].contractAddress as Address)
  : (testnet.transactions[1].contractAddress as Address);
export const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address;
