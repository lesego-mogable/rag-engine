import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: documents.length,
    indexed: documents.filter((d) => d.status === "indexed").length,
    processing: documents.filter((d) => d.status === "processing" || d.status === "queued").length,
    failed: documents.filter((d) => d.status === "failed").length,
  };

  return NextResponse.json({ documents, stats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, size, type, blobName } = await req.json();
  if (!name || !size || !type || !blobName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const doc = await prisma.document.create({
    data: {
      name,
      size: Number(size),
      type,
      blobName,
      status: "queued",
      uploadedById: session.user.id,
    },
  });

  const aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL ?? "http://localhost:8000";
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const callbackUrl = `${nextAuthUrl}/api/documents/${doc.id}/status`;

  fetch(`${aiEngineUrl}/api/v1/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id: doc.id,
      blob_name: blobName,
      callback_url: callbackUrl,
      callback_secret: process.env.INGEST_CALLBACK_SECRET ?? "",
    }),
  }).catch(() => {});

  return NextResponse.json(doc, { status: 201 });
}
