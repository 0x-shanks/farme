import { zdk } from "@/utils/zora";
import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { Address, zeroAddress } from "viem";
import axios from "axios";
import { ZDKChain } from "@zoralabs/zdk";
import { base, mainnet, optimism, zora, zoraSepolia } from "viem/chains";

export const revalidate = 600;

export async function GET(
  request: NextRequest,
  { params }: { params: { address: Address; id: string } },
) {
  const address = params.address;
  const id = params.id;
  const searchParams = request.nextUrl.searchParams;
  const chain = searchParams.get("chain");

  if (address == "0x" || address == zeroAddress) {
    throw new Error("Invalid address");
  }
  if (!chain) {
    throw new Error("chain params is not found");
  }
  const chainId = Number(chain);
  // contract summary
  let chainName = "";

  //sales
  let domain = "zora.co";
  let shortChainName = "";

  switch (chainId) {
    case mainnet.id:
      chainName = ZDKChain.Mainnet;
      shortChainName = "eth";
      break;
    case base.id:
      chainName = ZDKChain.BaseMainnet;
      shortChainName = "base";
      break;
    case optimism.id:
      chainName = ZDKChain.OptimismMainnet;
      shortChainName = "oeth";
      break;
    case zora.id:
      chainName = ZDKChain.ZoraMainnet;
      shortChainName = "zora";
      break;
    case zoraSepolia.id:
      chainName = "ZORA-SEPOLIA";
      domain = "testnet.zora.co";
      shortChainName = "zsep";
      break;
    default:
      throw new Error("invalid chain");
  }

  console.log(
    `https://api.zora.co/discover/contract_summary/${chainName}/${address}?token_id=${id}`,
  );

  const getContractSummary = cache(
    async () =>
      await axios.get(
        `https://api.zora.co/discover/contract_summary/${chainName}/${address}?token_id=${id}`,
      ),
  );

  const getSales = cache(
    async () =>
      await axios.get(
        `https://${domain}/api/personalize/collection/${shortChainName}:${address}/${id}/sales
        `,
      ),
  );

  const contractSummary = await getContractSummary();
  const sales = await getSales();
  return NextResponse.json({
    contractSummary: contractSummary.data.contract_summary,
    sales: sales.data.sales,
  });
}
