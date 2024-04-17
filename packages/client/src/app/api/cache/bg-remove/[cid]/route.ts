import { BgRemovedCidResponse } from "@/models/bgRemovedCidResponse";
import { CreateBgRemovedCidRequest } from "@/models/createBgRemovedCidRequest";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { cid: string } },
) {
  const retrievedBgRemovedCid = await kv.get<string>(params.cid);
  const response: BgRemovedCidResponse = {
    cid: retrievedBgRemovedCid ?? "",
  };
  return NextResponse.json(response);
}

export async function POST(
  request: Request,
  { params }: { params: { cid: string } },
) {
  const res = (await request.json()) as CreateBgRemovedCidRequest;

  await kv.set(params.cid, res.bgRemovedCid);
  return NextResponse.json("");
}
