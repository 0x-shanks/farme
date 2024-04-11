import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await axios.post<ArrayBuffer>(
    `${process.env.BG_REMOVE_URL}/api/main`,
    formData,
    {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "image/png",
      },
    },
  );

  return new Response(response.data, { status: 200 });
}