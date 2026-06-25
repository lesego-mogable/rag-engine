# /apps/ai-engine/src/main.py

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from src.kernel import initialize_rag_kernel, execute_rag_query
from src.services import ingest as ingest_service

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Semantic Kernel and Azure Connections...")
    try:
        kernel, memory = await initialize_rag_kernel()
        app.state.kernel = kernel
        app.state.memory = memory
        print("AI Engine ready.")
    except Exception as e:
        print(f"Failed to initialize AI Engine: {e}")

    yield

    print("Shutting down AI Engine...")


app = FastAPI(title="Enterprise AI Engine", version="1.0.0", lifespan=lifespan)

app.include_router(ingest_service.router, prefix="/api/v1")


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str


@app.post("/api/v1/query", response_model=QueryResponse)
async def query_enterprise_data(body: QueryRequest, request: Request):
    kernel = getattr(request.app.state, "kernel", None)
    memory = getattr(request.app.state, "memory", None)
    index_name = os.getenv("AZURE_AI_SEARCH_INDEX_NAME", "enterprise-docs-index")

    if not kernel or not memory:
        raise HTTPException(status_code=503, detail="AI Engine is not initialized.")

    try:
        answer = await execute_rag_query(
            query=body.query,
            kernel=kernel,
            memory=memory,
            index_name=index_name,
        )
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check(request: Request):
    return {"status": "healthy", "kernel_loaded": hasattr(request.app.state, "kernel")}
