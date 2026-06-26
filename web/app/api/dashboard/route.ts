import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalQueries, totalChats, activeUsers, docsIndexed, recentMessages, recentDocs, volumeRaw] =
    await Promise.all([
      // Total user messages (= queries) in period
      prisma.chatMessage.count({
        where: { role: "user", createdAt: { gte: since } },
      }),

      // Total chats started in period
      prisma.chat.count({
        where: { createdAt: { gte: since } },
      }),

      // Distinct users who chatted in period
      prisma.chat.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: since } },
      }),

      // Indexed documents (all time)
      prisma.document.count({ where: { status: "indexed" } }),

      // 5 most recent user messages for "Recent Queries"
      prisma.chatMessage.findMany({
        where: { role: "user", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { chat: { select: { title: true } } },
      }),

      // 5 most recently indexed documents
      prisma.document.findMany({
        where: { status: "indexed" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { name: true, chunkCount: true, updatedAt: true },
      }),

      // Daily query counts for the chart
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
        FROM "ChatMessage"
        WHERE role = 'user' AND "createdAt" >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

  return NextResponse.json({
    totalQueries,
    totalChats,
    activeUsers: activeUsers.length,
    docsIndexed,
    recentQueries: recentMessages.map((m) => ({
      content: m.content,
      createdAt: m.createdAt,
      chatTitle: m.chat.title,
    })),
    recentDocs: recentDocs.map((d) => ({
      name: d.name,
      chunkCount: d.chunkCount,
      updatedAt: d.updatedAt,
    })),
    queryVolume: volumeRaw.map((r) => ({
      date: r.day.toISOString().slice(0, 10),
      count: Number(r.count),
    })),
  });
}
