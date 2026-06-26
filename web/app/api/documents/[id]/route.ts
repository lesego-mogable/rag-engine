import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BlobServiceClient } from "@azure/storage-blob";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findFirst({
    where: { id: params.id },
    select: { blobName: true },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from DB first so the document disappears from the UI immediately
  await prisma.document.delete({ where: { id: params.id } });

  // Clean up Blob Storage
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!
    );
    await containerClient.deleteBlob(doc.blobName, { deleteSnapshots: "include" });
  } catch (err) {
    console.error("Blob delete failed:", err);
  }

  // Remove all indexed chunks from AI Search
  try {
    const searchClient = new SearchClient(
      process.env.AZURE_AI_SEARCH_ENDPOINT!,
      process.env.AZURE_AI_SEARCH_INDEX_NAME!,
      new AzureKeyCredential(process.env.AZURE_AI_SEARCH_ADMIN_KEY!)
    );

    // Fetch all chunk IDs for this blob
    const results = searchClient.search("*", {
      filter: `blob_name eq '${doc.blobName}'`,
      select: ["id"],
      top: 1000,
    });

    const ids: string[] = [];
    for await (const r of results.results) {
      ids.push((r.document as { id: string }).id);
    }

    if (ids.length > 0) {
      await searchClient.deleteDocuments("id", ids);
    }
  } catch (err) {
    console.error("AI Search cleanup failed:", err);
  }

  return NextResponse.json({ deleted: true });
}
