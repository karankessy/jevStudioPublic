import { NextResponse } from "next/server";
import { clearApiKey, getMaskedKey, isConnected, setApiKey } from "@/lib/env-store";

export async function GET() {
  return NextResponse.json({
    connected: isConnected(),
    masked: getMaskedKey(),
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const apiKey = (body as { apiKey?: unknown }).apiKey;
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return NextResponse.json({ message: "API key cannot be empty." }, { status: 400 });
  }

  try {
    const { persisted } = setApiKey(apiKey);
    return NextResponse.json({
      connected: true,
      masked: getMaskedKey(),
      persisted,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Could not save API key." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  clearApiKey();
  return NextResponse.json({ connected: false, masked: null });
}
