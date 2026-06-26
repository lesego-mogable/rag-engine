import io
import logging
import os
import traceback
from typing import List

import httpx
import pdfplumber
from azure.ai.documentintelligence.aio import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.aio import SearchClient
from azure.storage.blob.aio import BlobServiceClient
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from openai import AsyncAzureOpenAI
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


class IngestRequest(BaseModel):
    document_id: str
    blob_name: str
    callback_url: str
    callback_secret: str


def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 400) -> List[str]:
    """Split text into overlapping chunks, breaking at sentence boundaries where possible."""
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = min(start + chunk_size, text_length)
        # Try to break at a sentence boundary within the last 200 chars of the chunk
        if end < text_length:
            boundary = text.rfind(". ", end - 200, end)
            if boundary != -1:
                end = boundary + 1
        chunks.append(text[start:end].strip())
        if end >= text_length:
            break
        start = end - overlap
    return [c for c in chunks if c]


async def run_ingestion(
    document_id: str,
    blob_name: str,
    callback_url: str,
    callback_secret: str,
    openai_client: AsyncAzureOpenAI,
    search_client: SearchClient,
) -> None:
    logger.info("[ingest] Starting ingestion document_id=%s blob=%s", document_id, blob_name)

    try:
        # Step 0: Delete any existing chunks for this document to avoid stale data on reindex
        existing = await search_client.search(
            search_text="*",
            filter=f"document_id eq '{document_id}'",
            select=["id"],
            top=1000,
        )
        old_ids = [r["id"] async for r in existing]
        if old_ids:
            await search_client.delete_documents([{"id": id_} for id_ in old_ids])
            logger.info("[ingest] Deleted %d stale chunks for document_id=%s", len(old_ids), document_id)

        # Step 1: Download blob
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "").strip()
        container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "documents")
        logger.info("[ingest] Downloading blob from container=%s blob=%s", container_name, blob_name)

        async with BlobServiceClient.from_connection_string(connection_string) as blob_service:
            blob_client = blob_service.get_blob_client(container=container_name, blob=blob_name)
            download_stream = await blob_client.download_blob()
            blob_bytes = await download_stream.readall()
        logger.info("[ingest] Downloaded %d bytes", len(blob_bytes))

        # Step 2: Extract text and tables
        # Use pdfplumber for PDFs (no page limit, accurate table detection).
        # Fall back to Azure Document Intelligence for non-PDF files (Word, images, etc.).
        full_text = ""
        table_chunks: List[str] = []

        is_pdf = blob_name.lower().endswith(".pdf")
        if is_pdf:
            logger.info("[ingest] Extracting with pdfplumber blob=%s", blob_name)
            with pdfplumber.open(io.BytesIO(blob_bytes)) as pdf:
                page_texts = []
                for page_num, page in enumerate(pdf.pages):
                    # Extract plain text
                    text = page.extract_text() or ""
                    page_texts.append(text)

                    # Extract tables from this page
                    for t_idx, table in enumerate(page.extract_tables() or []):
                        if not table:
                            continue
                        header = table[0]
                        rows = table[1:]
                        header_line = " | ".join(str(c or "") for c in header)
                        data_lines = [
                            " | ".join(str(c or "") for c in row)
                            for row in rows if any(c for c in row)
                        ]
                        if data_lines:
                            table_chunks.append(
                                f"Table (page {page_num + 1}):\n{header_line}\n" + "\n".join(data_lines)
                            )

                full_text = "\n".join(page_texts)
                logger.info(
                    "[ingest] pdfplumber extracted %d chars across %d pages, %d table chunks",
                    len(full_text), len(pdf.pages), len(table_chunks),
                )
        else:
            doc_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "").strip()
            doc_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "").strip()
            logger.info("[ingest] Falling back to Document Intelligence for non-PDF blob=%s", blob_name)

            async with DocumentIntelligenceClient(
                endpoint=doc_endpoint,
                credential=AzureKeyCredential(doc_key),
            ) as doc_client:
                poller = await doc_client.begin_analyze_document("prebuilt-layout", body=blob_bytes)
                result = await poller.result()

            page_texts = []
            for page in result.pages:
                line_texts = [line.content for line in (page.lines or [])]
                page_texts.append(" ".join(line_texts))
            full_text = "\n".join(page_texts)

            for t_idx, table in enumerate(result.tables or []):
                grid: dict[int, dict[int, str]] = {}
                header_kinds: set[int] = set()
                for cell in (table.cells or []):
                    grid.setdefault(cell.row_index, {})[cell.column_index] = cell.content or ""
                    if getattr(cell, "kind", None) == "columnHeader":
                        header_kinds.add(cell.row_index)
                sorted_rows = sorted(grid.keys())
                if not sorted_rows:
                    continue
                header_row_indices = sorted(header_kinds) if header_kinds else [sorted_rows[0]]
                header_text = "\n".join(
                    " | ".join(grid[i].get(c, "") for c in sorted(grid[i].keys()))
                    for i in header_row_indices
                )
                data_lines = [
                    " | ".join(grid[r].get(c, "") for c in sorted(grid[r].keys()))
                    for r in sorted_rows if r not in header_row_indices
                ]
                if data_lines:
                    table_chunks.append(f"Table {t_idx + 1}:\n{header_text}\n" + "\n".join(data_lines))

            logger.info(
                "[ingest] Document Intelligence extracted %d chars, %d table chunks",
                len(full_text), len(table_chunks),
            )

        # Step 3: Chunk page text + append each table as its own standalone chunk
        chunks = chunk_text(full_text) + table_chunks
        logger.info("[ingest] Created %d chunks (%d table chunks)", len(chunks), len(table_chunks))

        # Step 4: Embed and upload to AI Search
        embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
        documents = []
        total_embedding_tokens = 0
        for i, chunk in enumerate(chunks):
            embedding_response = await openai_client.embeddings.create(
                input=chunk,
                model=embedding_deployment,
            )
            vector = embedding_response.data[0].embedding
            total_embedding_tokens += embedding_response.usage.total_tokens
            documents.append({
                "id": f"{document_id}-chunk-{i}",
                "content": chunk,
                "content_vector": vector,
                "document_id": document_id,
                "blob_name": blob_name,
                "chunk_index": i,
            })
            if (i + 1) % 5 == 0:
                logger.info("[ingest] Embedded %d/%d chunks", i + 1, len(chunks))

        await search_client.upload_documents(documents=documents)
        logger.info("[ingest] Uploaded %d documents to AI Search, total_embedding_tokens=%d", len(documents), total_embedding_tokens)

        # Step 5: Callback — success
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.patch(
                callback_url,
                json={"status": "indexed", "chunk_count": len(chunks), "embedding_tokens": total_embedding_tokens, "secret": callback_secret},
            )
            logger.info("[ingest] Callback response status=%d", resp.status_code)

        logger.info("[ingest] Completed successfully document_id=%s", document_id)

    except Exception:
        full_error = traceback.format_exc()
        logger.error("[ingest] FAILED document_id=%s\n%s", document_id, full_error)
        async with httpx.AsyncClient() as http_client:
            await http_client.patch(
                callback_url,
                json={"status": "failed", "error": full_error, "secret": callback_secret},
            )


@router.post("/ingest")
async def ingest_document(
    body: IngestRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    expected_secret = os.getenv("INGEST_CALLBACK_SECRET", "")
    if not expected_secret or body.callback_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Invalid callback secret.")

    openai_client = getattr(request.app.state, "openai_client", None)
    search_client = getattr(request.app.state, "search_client", None)

    if not openai_client or not search_client:
        raise HTTPException(status_code=503, detail="AI Engine is not initialized.")

    logger.info("[ingest] Accepted request document_id=%s blob=%s", body.document_id, body.blob_name)

    background_tasks.add_task(
        run_ingestion,
        document_id=body.document_id,
        blob_name=body.blob_name,
        callback_url=body.callback_url,
        callback_secret=body.callback_secret,
        openai_client=openai_client,
        search_client=search_client,
    )

    return {"accepted": True}
