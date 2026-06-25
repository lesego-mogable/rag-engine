import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from src.kernel import initialize_rag_kernel, execute_rag_query
from src.services import ingest as ingest_service

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Azure connections...")
    try:
        openai_client, search_client = await initialize_rag_kernel()
        app.state.openai_client = openai_client
        app.state.search_client = search_client
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
    openai_client = getattr(request.app.state, "openai_client", None)
    search_client = getattr(request.app.state, "search_client", None)

    if not openai_client or not search_client:
        raise HTTPException(status_code=503, detail="AI Engine is not initialized.")

    try:
        answer = await execute_rag_query(
            query=body.query,
            openai_client=openai_client,
            search_client=search_client,
        )
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check(request: Request):
    return {"status": "healthy", "kernel_loaded": hasattr(request.app.state, "openai_client")}
