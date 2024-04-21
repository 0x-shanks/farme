import { ZDKChain } from '@zoralabs/zdk';
import { base, mainnet, optimism, zora, zoraSepolia } from 'viem/chains';

export const getChainName = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return ZDKChain.Mainnet;
    case base.id:
      return ZDKChain.BaseMainnet;
    case optimism.id:
      return ZDKChain.OptimismMainnet;
    case zora.id:
      return ZDKChain.ZoraMainnet;
    case zoraSepolia.id:
      return 'ZORA-SEPOLIA';
    default:
      throw new Error('invalid chain');
  }
};

export const getChainNameShorthand = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
      return 'eth';
    case base.id:
      return 'base';
    case optimism.id:
      return 'oeth';
    case zora.id:
      return 'zora';
    case zoraSepolia.id:
      return 'zsep';
    default:
      throw new Error('invalid chain');
  }
};

export const getDomainFromChain = (chainId: number) => {
  switch (chainId) {
    case mainnet.id:
    case base.id:
    case optimism.id:
    case zora.id:
      return 'zora.co';
    case zoraSepolia.id:
      return 'testnet.zora.co';
    default:
      throw new Error('invalid chain');
  }
};
