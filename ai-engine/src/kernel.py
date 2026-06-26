import asyncio
import logging
import os
from openai import AsyncAzureOpenAI, NotFoundError

logger = logging.getLogger(__name__)
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex,
    SimpleField,
    SearchableField,
    SearchField,
    SearchFieldDataType,
    VectorSearch,
    HnswAlgorithmConfiguration,
    VectorSearchProfile,
)


def _ensure_search_index(endpoint: str, admin_key: str, index_name: str) -> None:
    credential = AzureKeyCredential(admin_key)
    index_client = SearchIndexClient(endpoint=endpoint, credential=credential)

    existing = list(index_client.list_index_names())
    if index_name in existing:
        return

    fields = [
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SearchField(
            name="content_vector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="default-profile",
        ),
        SimpleField(name="document_id", type=SearchFieldDataType.String, filterable=True),
        SimpleField(name="blob_name", type=SearchFieldDataType.String),
        SimpleField(name="chunk_index", type=SearchFieldDataType.Int32),
    ]

    vector_search = VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="hnsw")],
        profiles=[VectorSearchProfile(name="default-profile", algorithm_configuration_name="hnsw")],
    )

    index = SearchIndex(name=index_name, fields=fields, vector_search=vector_search)
    index_client.create_index(index)
    print(f"Created AI Search index: {index_name}")


async def initialize_rag_kernel():
    openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
    search_endpoint = os.getenv("AZURE_AI_SEARCH_ENDPOINT")
    search_admin_key = os.getenv("AZURE_AI_SEARCH_ADMIN_KEY")
    index_name = os.getenv("AZURE_AI_SEARCH_INDEX_NAME", "enterprise-docs-index")

    if not all([openai_endpoint, openai_api_key, search_endpoint, search_admin_key]):
        raise ValueError("Missing required Azure configuration in environment.")

    openai_client = AsyncAzureOpenAI(
        azure_endpoint=openai_endpoint,
        api_key=openai_api_key,
        api_version="2024-10-21",
    )

    _ensure_search_index(search_endpoint, search_admin_key, index_name)

    search_client = SearchClient(
        endpoint=search_endpoint,
        index_name=index_name,
        credential=AzureKeyCredential(search_admin_key),
    )

    return openai_client, search_client


async def execute_rag_query(query: str, openai_client: AsyncAzureOpenAI, search_client: SearchClient) -> dict:
    import time
    embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
    chat_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4.1-mini")

    t_start = time.monotonic()

    embedding_response = await openai_client.embeddings.create(
        input=query,
        model=embedding_deployment,
    )
    query_vector = embedding_response.data[0].embedding
    embedding_tokens = embedding_response.usage.total_tokens

    from azure.search.documents.models import VectorizedQuery
    vector_query = VectorizedQuery(vector=query_vector, k_nearest_neighbors=3, fields="content_vector")

    results = await search_client.search(
        search_text=None,
        vector_queries=[vector_query],
        select=["content", "document_id"],
        top=3,
    )

    chunks = []
    async for result in results:
        chunks.append(result["content"])

    if not chunks:
        latency_ms = int((time.monotonic() - t_start) * 1000)
        return {
            "answer": "I could not find any relevant information in the internal knowledge base.",
            "input_tokens": 0,
            "output_tokens": 0,
            "embedding_tokens": embedding_tokens,
            "latency_ms": latency_ms,
        }

    grounding_context = "\n---\n".join(chunks)

    for attempt in range(3):
        try:
            completion = await openai_client.chat.completions.create(
                model=chat_deployment,
                temperature=0.0,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an enterprise AI assistant. "
                            "Answer using ONLY the provided context. "
                            "If the context does not contain the answer, say you don't know. "
                            "Do not use external knowledge."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Context:\n{grounding_context}\n\nQuestion: {query}",
                    },
                ],
            )
            latency_ms = int((time.monotonic() - t_start) * 1000)
            usage = completion.usage
            return {
                "answer": completion.choices[0].message.content,
                "input_tokens": usage.prompt_tokens if usage else 0,
                "output_tokens": usage.completion_tokens if usage else 0,
                "embedding_tokens": embedding_tokens,
                "latency_ms": latency_ms,
            }
        except NotFoundError:
            if attempt < 2:
                wait = 2 ** attempt
                logger.warning("[query] DeploymentNotFound on attempt %d, retrying in %ds", attempt + 1, wait)
                await asyncio.sleep(wait)
            else:
                raise
