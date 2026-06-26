# lsg-RAG Engine

A production-ready, enterprise-grade **Retrieval-Augmented Generation (RAG)** system built with **Next.js**, **FastAPI**, and **Azure AI Services**. Ask questions about your internal documents and get intelligent, grounded answers with full traceability.

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-green)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-brightgreen)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.4-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api) • [Development](#-development)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Usage Examples](#-usage-examples)
- [Development](#-development)
- [Deployment](#-deployment)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Lumina RAG Engine** bridges the gap between large language models and your private knowledge base. Instead of relying solely on pre-trained data, it:

1. **Indexes** your documents with vector embeddings and full-text search
2. **Retrieves** the most relevant chunks using hybrid search (semantic + keyword)
3. **Augments** user queries with retrieved context
4. **Generates** accurate, grounded answers using GPT-4

### Why RAG?

Traditional LLMs suffer from:
- ❌ **Hallucinations** — Making up facts outside their training data
- ❌ **Outdated knowledge** — Can't access real-time or proprietary information
- ❌ **Lack of traceability** — Can't cite sources

**Lumina** solves these with:
- ✅ **Grounded responses** — Answers backed by your actual documents
- ✅ **Current data** — Access to fresh documents ingested in real-time
- ✅ **Full citations** — Know exactly which documents were used

---

## ✨ Features

### 🔍 Intelligent Search
- **Hybrid Search**: Combines vector similarity (semantic) + BM25 keyword matching for superior recall
- **Overlapping Chunks**: Preserves context across document boundaries (2000 chars, 400-char overlap)
- **Real-time Indexing**: New documents available for search immediately after ingestion

### 🤖 AI-Powered Generation
- **GPT-4 Integration**: State-of-the-art LLM via Azure OpenAI
- **Token Tracking**: Monitor input/output tokens and embedding costs
- **Latency Metrics**: End-to-end response time tracking for optimization

### 📄 Document Processing
- **Multi-format Support**: PDFs, Word docs, images, structured data
- **OCR Capabilities**: Handle scanned documents with Azure Document Intelligence
- **Intelligent Chunking**: Breaks documents at sentence boundaries for coherence
- **Background Processing**: Async ingestion with webhook callbacks

### 👥 Enterprise Features
- **User Authentication**: NextAuth.js with bcrypt password hashing
- **Document Management**: Upload, delete, and track document status
- **Role-based Access**: Ready for permission-based filtering (customizable)
- **Audit Trail**: Track queries, ingestions, and user actions

### 🎨 Modern UI
- **Chat Interface**: Real-time conversation with documents
- **Dashboard**: Analytics and usage metrics
- **Document Browser**: View and manage indexed documents
- **Advanced Search**: Filter, sort, and explore results
- **Responsive Design**: Tailwind CSS for mobile-friendly UI

### 🔧 Developer-Friendly
- **Type Safety**: Full TypeScript + Pydantic validation
- **REST API**: Clean, RESTful endpoints
- **Docker-Ready**: Full docker-compose setup for local development
- **Monorepo**: Turbo-powered build system for fast builds

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│     Next.js Frontend (Port 3000)                    │
│  Chat | Dashboard | Documents | Search              │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/REST (JSON)
┌────────────────▼────────────────────────────────────┐
│       FastAPI Backend (Port 8000)                   │
│  RAG Kernel | Document Ingestion | Query Service    │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┼────────┬──────────┐
        │        │        │          │
┌───────▼──┐ ┌──▼──┐ ┌───▼──────────▼──────────────┐
│PostgreSQL│ │Redis│ │   Azure AI Services:         │
│(Port5433)│ │6380 │ │  • OpenAI (GPT-4, Embeddings)│
└──────────┘ └─────┘ │  • AI Search (Vector DB)     │
                      │  • Blob Storage (Docs)       │
                      │  • Document Intelligence     │
                      └──────────────────────────────┘
```

### RAG Pipeline

```
User Query
    ↓
[1. Embedding] ─→ OpenAI text-embedding-3-small
    ↓
[2. Hybrid Search] ─→ Azure AI Search
    ├─ Vector Search (HNSW) ─→ Top-6 semantic matches
    └─ BM25 Keyword Search ─→ Top-6 keyword matches
    ↓
[3. Chunk Retrieval] ─→ Combine & deduplicate results
    ↓
[4. Context Assembly] ─→ Build augmented prompt
    ↓
[5. LLM Generation] ─→ Azure OpenAI GPT-4
    ↓
[6. Response] ─→ Answer + Metrics (tokens, latency)
```

### Directory Structure

```
rag-engine/
│
├── ai-engine/                 # Python FastAPI Backend
│   ├── src/
│   │   ├── kernel.py         # RAG pipeline logic
│   │   ├── main.py           # FastAPI app & routes
│   │   └── services/
│   │       └── ingest.py      # Document ingestion service
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── web/                       # Next.js TypeScript Frontend
│   ├── app/
│   │   └── (app)/            # App layout group
│   │       ├── chat/         # Chat interface
│   │       ├── dashboard/    # Analytics dashboard
│   │       ├── documents/    # Document management
│   │       ├── search/       # Advanced search
│   │       └── layout.tsx    # Shared layout
│   ├── components/           # Reusable React components
│   ├── pages/api/            # API routes (if needed)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.local.example
│
├── docker-compose.yml        # Service orchestration
├── package.json              # Root monorepo config
├── turbo.json                # Build cache settings
├── README.md                 # This file
└── .gitignore
```

---

## 📦 Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows (WSL2)
- **Docker**: 20.10+ with Compose 1.29+
- **Node.js**: 20.0.0 or higher
- **Python**: 3.12 (handled by Docker, optional for local dev)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Disk**: 5GB+ for Docker images

### Azure Services Required
- ✅ **Azure OpenAI** (GPT-4 & text-embedding-3-small deployment)
- ✅ **Azure AI Search** (vector-enabled index)
- ✅ **Azure Blob Storage** (document storage)
- ✅ **Azure Document Intelligence** (optional, for OCR)
- ✅ **Azure Identity** (credentials management)

### API Keys
You'll need API keys/connection strings for:
- Azure OpenAI endpoint & API key
- Azure AI Search endpoint & admin key
- Azure Storage Account connection string
- NextAuth secret (generate with `openssl rand -base64 32`)

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/lesego-mogable/rag-engine.git
cd rag-engine
```

### 2. Setup Environment Variables
```bash
# Copy example files
cp ai-engine/.env.example ai-engine/.env
cp web/.env.local.example web/.env.local

# Edit with your Azure credentials
nano ai-engine/.env
nano web/.env.local
```

**Required Environment Variables:**

**ai-engine/.env:**
```env
# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4-1-mini

# Azure AI Search
AZURE_AI_SEARCH_ENDPOINT=https://your-resource.search.windows.net/
AZURE_AI_SEARCH_ADMIN_KEY=your-admin-key
AZURE_AI_SEARCH_INDEX_NAME=enterprise-docs-index

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_ACCOUNT_KEY=your-key

# Optional: Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-key
```

**web/.env.local:**
```env
# Database (auto-configured in docker-compose)
DATABASE_URL=postgresql://lumina_dev:lumina_password@db:5432/lumina_db

# Authentication
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000

# API Endpoint
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8000
```

### 3. Start Services
```bash
# Start all services (db, redis, ai-engine, web, pgadmin)
docker-compose up -d

# View logs
docker-compose logs -f

# Wait for services to be healthy (~30-60 seconds)
docker-compose ps
```

### 4. Access the Application
- **Web Interface**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **pgAdmin**: http://localhost:5050 (admin@example.com / admin)

### 5. Upload a Test Document
1. Navigate to http://localhost:3000/documents
2. Click "Upload Document"
3. Select a PDF or document file
4. Wait for ingestion to complete

### 6. Try RAG
1. Go to http://localhost:3000/chat
2. Ask a question about your document
3. Get AI-powered answers with citations!

---

## ⚙️ Configuration

### Database Configuration
PostgreSQL is configured via environment variables in `docker-compose.yml`:
```yaml
POSTGRES_USER: lumina_dev
POSTGRES_PASSWORD: lumina_password
POSTGRES_DB: lumina_db
```

**To use an external database:**
1. Update `DATABASE_URL` in `web/.env.local`
2. Comment out `db` service in `docker-compose.yml`
3. Run migrations: `npx prisma migrate deploy`

### Azure Credentials
Use **Azure CLI** for easy credential management:
```bash
# Login to Azure
az login

# Get credentials automatically
az account get-access-token --resource https://search.azure.com

# Set environment variables from CLI
export AZURE_OPENAI_API_KEY=$(az account show --query "secrets.default" -o tsv)
```

### Customizing Search Behavior
Edit `ai-engine/src/kernel.py`:
```python
# Adjust top results returned (default: 6)
top=6

# Adjust chunk overlap (default: 400 chars)
overlap=400

# Adjust chunk size (default: 2000 chars)
chunk_size=2000

# Adjust number of nearest neighbors (default: 6)
k_nearest_neighbors=6
```

### Performance Tuning
```python
# In kernel.py execute_rag_query()

# Increase for better recall, slower response
top=12  # Default: 6

# Decrease for faster but less comprehensive answers
top=3   # Minimal context

# Adjust embedding model (smaller = faster, less accurate)
embedding_deployment="text-embedding-3-small"  # Default
embedding_deployment="text-embedding-3-large"  # More accurate

# Adjust LLM model (gpt-4-1-mini is balanced)
chat_deployment="gpt-35-turbo"  # Faster, cheaper
chat_deployment="gpt-4"         # More capable
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### 1. RAG Query Endpoint
**Ask a question about your documents**

```http
POST /api/v1/query
Content-Type: application/json

{
  "query": "What is the company's return policy?"
}
```

**Response:**
```json
{
  "answer": "According to our policy document, customers have 30 days to return items in original condition with receipt.",
  "input_tokens": 245,
  "output_tokens": 89,
  "embedding_tokens": 32,
  "latency_ms": 1243
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `answer` | string | AI-generated answer based on retrieved documents |
| `input_tokens` | int | Tokens used for the query embedding |
| `output_tokens` | int | Tokens used for the LLM response |
| `embedding_tokens` | int | Total embedding tokens consumed |
| `latency_ms` | int | Total time in milliseconds |

---

#### 2. Document Ingestion Endpoint
**Upload and index a new document**

```http
POST /api/v1/ingest
Content-Type: application/json

{
  "document_id": "doc-2024-001",
  "blob_name": "policies/return-policy-2024.pdf",
  "callback_url": "https://example.com/webhooks/ingest-complete",
  "callback_secret": "webhook-secret-key"
}
```

**Process:**
1. Retrieves document from Azure Blob Storage
2. Extracts text and metadata
3. Chunks into overlapping segments
4. Generates vector embeddings
5. Indexes in Azure AI Search
6. Calls webhook callback with status

**Callback Response (Webhook):**
```json
{
  "document_id": "doc-2024-001",
  "status": "completed",
  "chunks_created": 15,
  "embedding_tokens": 2456,
  "timestamp": "2024-06-26T10:30:00Z"
}
```

---

### Error Handling

**Rate Limited:**
```json
{
  "detail": "Too many requests. Try again later."
}
```

**Invalid Query:**
```json
{
  "detail": [
    {
      "loc": ["body", "query"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Service Error:**
```json
{
  "detail": "Failed to connect to Azure Search. Please try again."
}
```

---

## 📚 Usage Examples

### Example 1: Ask About Company Policy
```bash
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the requirements for remote work approval?"
  }'
```

### Example 2: Integration with Python
```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Query the RAG engine
response = requests.post(
    f"{BASE_URL}/query",
    json={"query": "What is our data retention policy?"}
)

result = response.json()
print(f"Answer: {result['answer']}")
print(f"Latency: {result['latency_ms']}ms")
print(f"Total tokens: {result['input_tokens'] + result['output_tokens']}")
```

### Example 3: Integration with JavaScript/TypeScript
```typescript
const query = "What benefits do employees receive?";

const response = await fetch('http://localhost:8000/api/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
});

const { answer, latency_ms } = await response.json();
console.log(`${answer}\n(Response time: ${latency_ms}ms)`);
```

### Example 4: Bulk Document Ingestion
```bash
#!/bin/bash

for file in ./documents/*.pdf; do
  doc_id=$(basename "$file" .pdf)
  blob_name="documents/$file"
  
  curl -X POST http://localhost:8000/api/v1/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"document_id\": \"$doc_id\",
      \"blob_name\": \"$blob_name\",
      \"callback_url\": \"https://example.com/webhook\",
      \"callback_secret\": \"secret\"
    }"
  
  echo "Queued: $doc_id"
done
```

---

## 🔧 Development

### Setup Local Development

#### Without Docker (Recommended for development)

**Backend:**
```bash
# Create Python virtual environment
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd ai-engine
pip install -r requirements.txt

# Create .env file with Azure credentials
cp .env.example .env
# Edit .env with your credentials

# Run FastAPI server
uvicorn src.main:app --reload --port 8000
```

**Frontend:**
```bash
# Install Node dependencies
cd web
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your settings

# Start Next.js dev server
npm run dev
# Access at http://localhost:3000
```

#### With Docker (Production-like)

```bash
# Build and start all services
docker-compose up --build

# View logs for specific service
docker-compose logs -f ai-engine
docker-compose logs -f web

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Run tests (when added)
npm run test
```

### Building for Production

```bash
# Full build
npm run build

# Production start
npm start
```

### Code Structure

**Backend (FastAPI):**
```
ai-engine/src/
├── kernel.py      # Core RAG logic
├── main.py        # FastAPI app setup
└── services/
    └── ingest.py  # Document processing
```

**Frontend (Next.js):**
```
web/
├── app/
│   └── (app)/     # App routes
│       ├── chat/
│       ├── dashboard/
│       ├── documents/
│       └── search/
└── components/    # Reusable components
```

---

## 🚀 Deployment

### Deploy to Azure Container Instances

```bash
# Build Docker images
docker-compose build

# Push to Azure Container Registry
az acr build --registry $REGISTRY_NAME --image lumina:latest .

# Deploy with docker-compose
az container create \
  --resource-group myResourceGroup \
  --name lumina-rag \
  --image-registry-login-server \
  --file docker-compose.yml
```

### Deploy to Kubernetes

```bash
# Create deployment manifest (helm chart recommended)
kubectl apply -f k8s/deployment.yaml

# Expose service
kubectl expose deployment lumina-web --type=LoadBalancer --port=80 --target-port=3000
```

### Environment Variables for Production
```env
# Use strong secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Use Azure-managed identities
AZURE_OPENAI_API_KEY=<from-azure-keyvault>

# Use production database
DATABASE_URL=postgresql://prod-user:prod-pwd@prod-server.postgres.database.azure.com/lumina_prod

# Disable debug
DEBUG=false
```

---

## 📊 Performance

### Benchmarks (Typical)
- **Query Latency**: 1.0 - 2.5 seconds (includes embedding + search + generation)
- **Embedding Time**: ~200-400ms
- **Search Time**: ~100-200ms
- **LLM Generation**: ~500-1500ms
- **Average Token Cost**: 300-500 tokens per query

### Optimization Tips
1. **Cache frequent queries** in Redis
2. **Increase chunk overlap** for better context preservation
3. **Use text-embedding-3-small** for speed (good for most cases)
4. **Batch document ingestion** for efficiency
5. **Monitor Azure Search quota** for rate limits

### Scaling Considerations
- **Horizontal**: Add more containers via Kubernetes
- **Vertical**: Increase container resources
- **Database**: Use read replicas for PostgreSQL
- **Cache**: Redis can be moved to Azure Cache for Redis
- **Search**: Azure AI Search scales automatically

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker daemon
docker ps

# Check port availability
lsof -i :3000
lsof -i :8000

# Reset docker
docker system prune -a
docker-compose up --build
```

### Azure Connection Errors
```
Error: "Invalid subscription ID"
```
**Solution**: Verify Azure credentials in `.env`
```bash
# Test connectivity
az login
az account show
```

### Slow Query Responses
```
Latency > 3000ms
```
**Solutions**:
1. Check Azure Search quota usage
2. Reduce `top` parameter in kernel.py (6 → 3)
3. Use smaller embedding model
4. Check network latency to Azure

### Out of Memory
```
Container killed: OOMKilled
```
**Solution**: Increase Docker memory allocation
```bash
# docker-compose.yml
services:
  ai-engine:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Database Connection Issues
```
psycopg2.OperationalError: could not connect to server
```
**Solution**: Wait for database to be healthy
```bash
docker-compose down
docker-compose up -d db
sleep 10
docker-compose up -d
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript, avoid `any` types
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

### Code Style
```bash
# Python
pip install black flake8
black ai-engine/
flake8 ai-engine/

# TypeScript
npm run lint
npm run type-check
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

### Getting Help
- 📖 **Documentation**: See `/docs` directory
- 🐛 **Issues**: Open an issue on GitHub
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Email**: lesegomogable@gmail.com

### Useful Resources
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure AI Search](https://learn.microsoft.com/en-us/azure/search/)
- [FastAPI Guide](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [RAG Best Practices](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/retrieval-augmented-generation)

---

## 🔐 Security

### Best Practices
- ✅ Never commit `.env` files
- ✅ Use Azure Key Vault for production secrets
- ✅ Enable HTTPS in production
- ✅ Implement rate limiting on API endpoints
- ✅ Use strong NextAuth secrets
- ✅ Regular security updates for dependencies

### Reporting Security Issues
If you find a security vulnerability, please email lesegomogable@gmail.com instead of using the issue tracker.

<div align="center">

**⭐ Found this helpful? Star the repository!**

[GitHub](https://github.com/lesego-mogable/rag-engine) • [Documentation](./docs) • [Issues](https://github.com/lesego-mogable/rag-engine/issues)

Made with ❤️ by the Lumina team

</div>
