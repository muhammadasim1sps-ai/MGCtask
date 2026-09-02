import { NextResponse } from "next/server";

const pythonApiUrl = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${pythonApiUrl}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Scoring service is unavailable. Start the Python API on port 8000." },
      { status: 503 },
    );
  }
}
