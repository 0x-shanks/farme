import { Address } from "viem";

export type TokenDetailResponse = {
  contractSummary: {
    first_minter: {
      ens_name: string;
      address: Address;
    };
    top_minter: {
      count: number;
      minter: {
        ens_name: string;
        address: Address;
      };
    };
    creator_earnings: {
      currency: {
        name: string;
      };
      decimal: number;
    };
    mint_count: number;
    unique_collector_count: number;
  };
  sales: {
    fixedPrice: {
      start: number;
      end: number;
      state: string;
    };
  };
};
