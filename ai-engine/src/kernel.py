# /apps/ai-engine/src/kernel.py

import os
from azure.identity.aio import DefaultAzureCredential
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion, AzureTextEmbedding
from semantic_kernel.connectors.memory.azure_cognitive_search import AzureCognitiveSearchMemoryStore
from semantic_kernel.memory.semantic_text_memory import SemanticTextMemory
from semantic_kernel.prompt_template.prompt_template_config import PromptTemplateConfig

async def initialize_rag_kernel() -> tuple[Kernel, SemanticTextMemory]:
    """
    Initializes Semantic Kernel using Microsoft Entra ID (DefaultAzureCredential).
    """
    kernel = Kernel()
    credential = DefaultAzureCredential()

    # Retrieve endpoints (Injected securely at runtime)
    aoai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    chat_deployment = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4o")
    embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")
    search_endpoint = os.getenv("AZURE_AI_SEARCH_ENDPOINT")

    if not aoai_endpoint or not search_endpoint:
        raise ValueError("Critical Azure endpoints are missing from the environment.")

    # Attach Azure OpenAI Services
    chat_service = AzureChatCompletion(
        service_id="default",
        deployment_name=chat_deployment,
        endpoint=aoai_endpoint,
        ad_token_provider=credential.get_token
    )
    embedding_service = AzureTextEmbedding(
        deployment_name=embedding_deployment,
        endpoint=aoai_endpoint,
        ad_token_provider=credential.get_token
    )
    kernel.add_service(chat_service)
    kernel.add_service(embedding_service)

    # Attach Azure AI Search (Vector Memory)
    vector_store = AzureCognitiveSearchMemoryStore(
        endpoint=search_endpoint,
        credentials=credential
    )
    memory = SemanticTextMemory(
        storage=vector_store,
        embeddings_generator=embedding_service
    )

    return kernel, memory

async def execute_rag_query(query: str, kernel: Kernel, memory: SemanticTextMemory, index_name: str) -> str:
    """
    Retrieves grounded context and executes the RAG prompt.
    """
    search_results = await memory.search(
        collection=index_name,
        query=query,
        limit=3,
        min_relevance_score=0.75
    )

    grounding_context = "\n---\n".join([result.text for result in search_results])

    if not grounding_context:
        return "I could not find any relevant information in the internal knowledge base."

    prompt = """
    You are an elite enterprise AI assistant. Answer the user's question using ONLY the provided context.
    If the context does not contain the answer, state explicitly that you do not know. 
    Do not use external knowledge.

    CONTEXT:
    {{$context}}

    USER QUESTION:
    {{$query}}
    """

    req_settings = kernel.get_prompt_execution_settings_from_service_id(service_id="default")
    req_settings.temperature = 0.0 # Strictly factual
    
    rag_function = kernel.create_function_from_prompt(
        prompt_template=prompt,
        plugin_name="EnterpriseRAG",
        function_name="AskGroundedQuestion",
        prompt_execution_settings=req_settings
    )

    result = await kernel.invoke(
        rag_function,
        query=query,
        context=grounding_context
    )

    return str(result)
