import { NextResponse } from "next/server";

const documentAssistantApiUrl =
  process.env.DOCUMENT_ASSISTANT_API_URL ?? "http://127.0.0.1:8001";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${documentAssistantApiUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Document assistant is unavailable. Start its Python API on port 8001.",
      },
      { status: 503 },
    );
  }
}
