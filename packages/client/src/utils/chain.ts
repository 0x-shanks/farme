import { base, mainnet, optimism, zora, zoraSepolia } from 'viem/chains';

export const getChain = (id: number) => {
  switch (id) {
    case mainnet.id:
      return mainnet;
    case base.id:
      return base;
    case optimism.id:
      return optimism;
    case zora.id:
      return zora;
    case zoraSepolia.id:
      return zoraSepolia;
    default:
      undefined;
  }
};
