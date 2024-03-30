import { zdk } from "@/utils/zora";
import { cache } from "react";
import { Address, zeroAddress } from "viem";
import { Chain, Token } from "@zoralabs/zdk/dist/queries/queries-sdk";
import { getIPFSPreviewURL } from "@/utils/ipfs/utils";
import { TokensResponse } from "@/models/tokensResponse";
import { ZDKChain, ZDKNetwork } from "@zoralabs/zdk";

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: { address: Address } },
) {
  const address = params.address;

  if (address == "0x" || address == zeroAddress) {
    throw new Error("Invalid address");
  }

  const getTokens = cache(
    async () =>
      await zdk.tokens({
        where: {
          ownerAddresses: [address],
        },
        networks: [
          { network: ZDKNetwork.Zora, chain: ZDKChain.ZoraMainnet },
          { network: ZDKNetwork.Base, chain: ZDKChain.BaseMainnet },
          { network: ZDKNetwork.Optimism, chain: ZDKChain.OptimismMainnet },
          { network: ZDKNetwork.Ethereum, chain: ZDKChain.Mainnet },
          {
            network: ZDKNetwork.Zora,
            chain: "ZORA_SEPOLIA" as Chain,
          },
        ],
      }),
  );

  const ts = await getTokens();
  const tokens: Token[] = ts.tokens.nodes
    .map((n) => n.token as Token)
    .map((token) => ({
      ...token,
      image: {
        ...token.image,
        url:
          token.image?.url?.split(":")[0] == "ipfs"
            ? getIPFSPreviewURL(token.image?.url.split("://")[1])
            : token.image?.url,
      },
    }));

  const response: TokensResponse = {
    tokens,
  };

  return Response.json(response);
}
