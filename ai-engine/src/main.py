# /apps/ai-engine/src/main.py

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from src.kernel import initialize_rag_kernel, execute_rag_query

# Load local .env (Will safely do nothing in production if .env is missing)
load_dotenv()

# Global state for Kernel and Memory
app_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event: Runs once when the API starts up.
    Initializes AI dependencies to ensure low-latency request handling.
    """
    print("Initializing Semantic Kernel and Azure Connections...")
    try:
        kernel, memory = await initialize_rag_kernel()
        app_state["kernel"] = kernel
        app_state["memory"] = memory
        print("AI Engine ready.")
    except Exception as e:
        print(f"Failed to initialize AI Engine: {e}")
        # In a strict production environment, you might want to raise here
        # to prevent the container from starting if dependencies are broken.
    
    yield
    
    # Cleanup logic (if any) would go here
    print("Shutting down AI Engine...")

# Initialize FastAPI app
app = FastAPI(title="Enterprise AI Engine", version="1.0.0", lifespan=lifespan)

# Pydantic Schemas for validation
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

@app.post("/api/v1/query", response_model=QueryResponse)
async def query_enterprise_data(request: QueryRequest):
    """
    HTTP POST endpoint for frontend applications (Next.js/Expo) to interface with the RAG engine.
    """
    kernel = app_state.get("kernel")
    memory = app_state.get("memory")
    index_name = os.getenv("AZURE_AI_SEARCH_INDEX_NAME", "enterprise-docs-index")

    if not kernel or not memory:
        raise HTTPException(status_code=503, detail="AI Engine is not initialized.")

    try:
        answer = await execute_rag_query(
            query=request.query,
            kernel=kernel,
            memory=memory,
            index_name=index_name
        )
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Liveness probe for Azure Container Apps routing."""
    return {"status": "healthy", "kernel_loaded": "kernel" in app_state}