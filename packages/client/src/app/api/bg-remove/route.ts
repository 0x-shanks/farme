import axios from "axios";

export async function POST(request: Request) {
  const formData = await request.formData();
  const response = await axios.post<ArrayBuffer>(
    `${process.env.BG_REMOVE_URL}/api/remove-background`,
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
