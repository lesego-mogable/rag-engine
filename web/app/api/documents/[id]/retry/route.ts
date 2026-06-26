import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    select: { blobName: true, status: true },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.document.update({
    where: { id: params.id },
    data: { status: "queued", errorMsg: null, chunkCount: null, embeddingTokens: null },
  });

  const aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL ?? "http://localhost:8000";
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const callbackUrl = `${nextAuthUrl}/api/documents/${params.id}/status`;

  fetch(`${aiEngineUrl}/api/v1/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id: params.id,
      blob_name: doc.blobName,
      callback_url: callbackUrl,
      callback_secret: process.env.INGEST_CALLBACK_SECRET ?? "",
    }),
  }).catch(() => {});

  return NextResponse.json({ queued: true });
}
