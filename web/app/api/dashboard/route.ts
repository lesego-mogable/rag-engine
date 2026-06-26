import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Azure OpenAI pricing (per 1M tokens)
const PRICE_INPUT_PER_M = 0.40;   // gpt-4.1-mini input
const PRICE_OUTPUT_PER_M = 1.60;  // gpt-4.1-mini output
const PRICE_EMBED_PER_M = 0.02;   // text-embedding-3-small

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalQueries,
    totalChats,
    activeUsers,
    docsIndexed,
    recentMessages,
    recentDocs,
    volumeRaw,
    tokenAgg,
    latencyAgg,
    docTokenAgg,
    storageAgg,
    dbSizeRaw,
    latencyPercentiles,
  ] = await Promise.all([
    prisma.chatMessage.count({ where: { role: "user", createdAt: { gte: since } } }),
    prisma.chat.count({ where: { createdAt: { gte: since } } }),
    prisma.chat.groupBy({ by: ["userId"], where: { createdAt: { gte: since } } }),
    prisma.document.count({ where: { status: "indexed" } }),

    prisma.chatMessage.findMany({
      where: { role: "user", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { chat: { select: { title: true } } },
    }),

    prisma.document.findMany({
      where: { status: "indexed" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { name: true, chunkCount: true, embeddingTokens: true, updatedAt: true },
    }),

    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
      FROM "ChatMessage"
      WHERE role = 'user' AND "createdAt" >= ${since}
      GROUP BY day ORDER BY day ASC
    `,

    // Token totals for chat messages in period
    prisma.chatMessage.aggregate({
      where: { role: "assistant", createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true, embeddingTokens: true },
    }),

    // Average latency in period
    prisma.chatMessage.aggregate({
      where: { role: "assistant", latencyMs: { not: null }, createdAt: { gte: since } },
      _avg: { latencyMs: true },
      _min: { latencyMs: true },
      _max: { latencyMs: true },
    }),

    // Embedding tokens from document ingestion (all time)
    prisma.document.aggregate({
      where: { status: "indexed" },
      _sum: { embeddingTokens: true },
    }),

    // Total bytes stored
    prisma.document.aggregate({
      _sum: { size: true },
    }),

    // DB size in bytes
    prisma.$queryRaw<{ size: bigint }[]>`
      SELECT pg_database_size(current_database()) AS size
    `,

    // P50/P95 latency approximation — get all latency values in period
    prisma.chatMessage.findMany({
      where: { role: "assistant", latencyMs: { not: null }, createdAt: { gte: since } },
      select: { latencyMs: true },
      orderBy: { latencyMs: "asc" },
    }),
  ]);

  const inputTokens = tokenAgg._sum.inputTokens ?? 0;
  const outputTokens = tokenAgg._sum.outputTokens ?? 0;
  const chatEmbedTokens = tokenAgg._sum.embeddingTokens ?? 0;
  const ingestEmbedTokens = docTokenAgg._sum.embeddingTokens ?? 0;
  const totalEmbedTokens = chatEmbedTokens + ingestEmbedTokens;

  const chatCost = (inputTokens / 1_000_000) * PRICE_INPUT_PER_M + (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  const embedCost = (totalEmbedTokens / 1_000_000) * PRICE_EMBED_PER_M;
  const totalCost = chatCost + embedCost;

  const avgLatency = Math.round(latencyAgg._avg.latencyMs ?? 0);
  const minLatency = latencyAgg._min.latencyMs ?? 0;
  const maxLatency = latencyAgg._max.latencyMs ?? 0;

  const latencyValues = latencyPercentiles.map((r) => r.latencyMs as number);
  const p50 = latencyValues.length ? latencyValues[Math.floor(latencyValues.length * 0.5)] : 0;
  const p95 = latencyValues.length ? latencyValues[Math.floor(latencyValues.length * 0.95)] : 0;

  const dbBytes = dbSizeRaw[0]?.size ? Number(dbSizeRaw[0].size) : 0;
  const storageBytes = storageAgg._sum.size ?? 0;

  return NextResponse.json({
    // Core KPIs
    totalQueries,
    totalChats,
    activeUsers: activeUsers.length,
    docsIndexed,

    // Token usage
    inputTokens,
    outputTokens,
    totalEmbedTokens,
    totalTokens: inputTokens + outputTokens + totalEmbedTokens,

    // Costs (USD)
    chatCost: Number(chatCost.toFixed(4)),
    embedCost: Number(embedCost.toFixed(4)),
    totalCost: Number(totalCost.toFixed(4)),

    // Latency (ms)
    avgLatency,
    minLatency,
    maxLatency,
    p50Latency: p50,
    p95Latency: p95,

    // Storage
    dbBytes,
    storageBytes,

    // Lists
    recentQueries: recentMessages.map((m) => ({
      content: m.content,
      createdAt: m.createdAt,
      chatTitle: m.chat.title,
    })),
    recentDocs: recentDocs.map((d) => ({
      name: d.name,
      chunkCount: d.chunkCount,
      embeddingTokens: d.embeddingTokens,
      updatedAt: d.updatedAt,
    })),
    queryVolume: volumeRaw.map((r) => ({
      date: r.day.toISOString().slice(0, 10),
      count: Number(r.count),
    })),
  });
}
