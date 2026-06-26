import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query?.trim()) return NextResponse.json({ error: "query required" }, { status: 400 });

  const aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL ?? "http://localhost:8000";

  const res = await fetch(`${aiEngineUrl}/api/v1/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: err.detail ?? "AI engine error" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json({
    answer: data.answer,
    inputTokens: data.input_tokens ?? 0,
    outputTokens: data.output_tokens ?? 0,
    embeddingTokens: data.embedding_tokens ?? 0,
    latencyMs: data.latency_ms ?? 0,
  });
}
