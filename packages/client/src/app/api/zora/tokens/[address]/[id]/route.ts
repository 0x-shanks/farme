import { zdk } from "@/utils/zora";
import { NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { Address, zeroAddress } from "viem";
import axios from "axios";
import { ZDKChain } from "@zoralabs/zdk";
import { base, mainnet, optimism, zora, zoraSepolia } from "viem/chains";
import {
  getChainName,
  getChainNameShorthand,
  getDomainFromChain,
} from "@/utils/zora/chain";

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
  const chainName = getChainName(chainId);

  //sales
  const domain = getDomainFromChain(chainId);
  const shortChainName = getChainNameShorthand(chainId);

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
