import { NextResponse } from "next/server";
import { evaluateJev, JevError } from "@/lib/jev";
import { jevRequestSchema } from "@/lib/validation";
import { MAX_REQUEST_BYTES } from "@/types/jev";

export async function POST(req: Request) {
  const raw = await req.text();
  const size = new TextEncoder().encode(raw).length;
  if (size > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      {
        code: "payload_too_large",
        message:
          "This evaluation is larger than the API request limit. Reduce the state or split the input.",
      },
      { status: 413 }
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { code: "invalid_request", message: "Request body is not valid JSON." },
      { status: 400 }
    );
  }

  const parsed = jevRequestSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        code: "invalid_request",
        message: first?.message ?? "Invalid evaluation request.",
        detail: JSON.stringify(parsed.error.issues),
      },
      { status: 400 }
    );
  }

  try {
    const result = await evaluateJev(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof JevError) {
      const status =
        err.shape.code === "auth_error"
          ? 401
          : err.shape.code === "rate_limited"
          ? 429
          : err.shape.code === "payload_too_large"
          ? 413
          : err.shape.code === "invalid_request" || err.shape.code === "invalid_question"
          ? 400
          : 500;
      return NextResponse.json(err.shape, { status });
    }
    return NextResponse.json(
      { code: "server_error", message: "The evaluation could not be completed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    connected: Boolean(process.env.AI_GATEWAY_API_KEY),
    provider: "Vercel AI Gateway",
  });
}
