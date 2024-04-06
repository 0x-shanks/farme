import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await axios.post<ArrayBuffer>(
    "http://localhost:8001/api/main",
    formData,
    {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "image/png",
      },
    }
  );

  return new Response(response.data, { status: 200 });
}
