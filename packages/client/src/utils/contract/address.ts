import { Address } from 'viem';
import data from './testnet.json';

export const canvasAddress = data.transactions[1].contractAddress as Address;
export const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address;
