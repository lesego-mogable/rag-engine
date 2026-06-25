import logging
import os
import traceback
from typing import List

import httpx
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


def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        if end >= text_length:
            break
        start = end - overlap
    return chunks


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
        # Step 1: Download blob
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "").strip()
        container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "documents")
        logger.info("[ingest] Downloading blob from container=%s blob=%s", container_name, blob_name)

        async with BlobServiceClient.from_connection_string(connection_string) as blob_service:
            blob_client = blob_service.get_blob_client(container=container_name, blob=blob_name)
            download_stream = await blob_client.download_blob()
            blob_bytes = await download_stream.readall()
        logger.info("[ingest] Downloaded %d bytes", len(blob_bytes))

        # Step 2: Extract text via Document Intelligence
        doc_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "").strip()
        doc_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "").strip()
        logger.info("[ingest] Sending to Document Intelligence endpoint=%s", doc_endpoint)

        async with DocumentIntelligenceClient(
            endpoint=doc_endpoint,
            credential=AzureKeyCredential(doc_key),
        ) as doc_client:
            poller = await doc_client.begin_analyze_document("prebuilt-read", body=blob_bytes)
            result = await poller.result()

        page_texts = []
        for page in result.pages:
            line_texts = [line.content for line in (page.lines or [])]
            page_texts.append(" ".join(line_texts))
        full_text = "\n".join(page_texts)
        logger.info("[ingest] Extracted %d characters across %d pages", len(full_text), len(result.pages))

        # Step 3: Chunk
        chunks = chunk_text(full_text)
        logger.info("[ingest] Created %d chunks", len(chunks))

        # Step 4: Embed and upload to AI Search
        embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
        documents = []
        for i, chunk in enumerate(chunks):
            embedding_response = await openai_client.embeddings.create(
                input=chunk,
                model=embedding_deployment,
            )
            vector = embedding_response.data[0].embedding
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
        logger.info("[ingest] Uploaded %d documents to AI Search", len(documents))

        # Step 5: Callback — success
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.patch(
                callback_url,
                json={"status": "indexed", "chunk_count": len(chunks), "secret": callback_secret},
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
