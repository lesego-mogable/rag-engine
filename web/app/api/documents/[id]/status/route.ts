import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status, chunk_count, error, secret } = await req.json();

  const expectedSecret = process.env.INGEST_CALLBACK_SECRET ?? "";
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = await prisma.document.update({
    where: { id: params.id },
    data: {
      status,
      ...(chunk_count !== undefined && { chunkCount: chunk_count }),
      ...(error !== undefined && { errorMsg: String(error) }),
    },
  });

  return NextResponse.json(doc);
}
