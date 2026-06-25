import json
import os
from typing import List

import httpx
from azure.ai.documentintelligence.aio import DocumentIntelligenceClient
from azure.identity.aio import DefaultAzureCredential
from azure.storage.blob.aio import BlobClient
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel

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
    memory,
    index_name: str,
) -> None:
    try:
        storage_account = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "documents")
        account_url = f"https://{storage_account}.blob.core.windows.net"

        credential = DefaultAzureCredential()

        async with BlobClient(
            account_url=account_url,
            container_name=container_name,
            blob_name=blob_name,
            credential=credential,
        ) as blob_client:
            download_stream = await blob_client.download_blob()
            blob_bytes = await download_stream.readall()

        doc_intelligence_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")

        async with DocumentIntelligenceClient(
            endpoint=doc_intelligence_endpoint,
            credential=DefaultAzureCredential(),
        ) as doc_client:
            poller = await doc_client.begin_analyze_document(
                "prebuilt-read", body=blob_bytes
            )
            result = await poller.result()

        page_texts = []
        for page in result.pages:
            line_texts = [line.content for line in (page.lines or [])]
            page_texts.append(" ".join(line_texts))
        full_text = "\n".join(page_texts)

        chunks = chunk_text(full_text)

        for i, chunk in enumerate(chunks):
            await memory.save_information(
                collection=index_name,
                id=f"{document_id}-chunk-{i}",
                text=chunk,
                additional_metadata=json.dumps({
                    "document_id": document_id,
                    "blob_name": blob_name,
                    "chunk_index": i,
                }),
            )

        async with httpx.AsyncClient() as http_client:
            await http_client.patch(
                callback_url,
                json={"status": "indexed", "chunk_count": len(chunks), "secret": callback_secret},
            )

    except Exception as e:
        async with httpx.AsyncClient() as http_client:
            await http_client.patch(
                callback_url,
                json={"status": "failed", "error": str(e), "secret": callback_secret},
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

    memory = getattr(request.app.state, "memory", None)
    if not memory:
        raise HTTPException(status_code=503, detail="AI Engine is not initialized.")

    index_name = os.getenv("AZURE_AI_SEARCH_INDEX_NAME", "enterprise-docs-index")

    background_tasks.add_task(
        run_ingestion,
        document_id=body.document_id,
        blob_name=body.blob_name,
        callback_url=body.callback_url,
        callback_secret=body.callback_secret,
        memory=memory,
        index_name=index_name,
    )

    return {"accepted": True}
