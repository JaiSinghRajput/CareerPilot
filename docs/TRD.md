# CareerPilot AI — Technology Stack & Technical Direction

## Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS v4
- Material UI
- React Router
- TanStack Query
- React Hook Form
- Zod
- Framer Motion
- Socket.IO Client

## Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- RBAC
- Multer
- BullMQ
- Redis
- Swagger/OpenAPI
- Socket.IO
- Cron Jobs

Architecture:
Routes → Controllers → Services → Repositories → Database

## AI Layer
Separate AI microservice.

Model:
- Llama 3.1 8B Instruct (Self Hosted)

Serving:
- vLLM (Production)
- Ollama (Development)

Embedding:
- BGE-M3 or Nomic Embed

Vector Database:
- Qdrant

Inference Strategy:
- Prompt Engineering
- RAG
- Structured JSON Outputs

Future:
- LoRA / QLoRA Fine-Tuning

## Database
- PostgreSQL
- Redis
- Qdrant
- MinIO (Object Storage)

## Authentication
- JWT
- Refresh Tokens
- Google OAuth
- GitHub OAuth

## Deployment
- Docker
- Nginx
- PM2 (optional)
- Jenkins/GitHub Actions
- Blue-Green Deployment

## Security
- HTTPS
- Helmet
- Rate Limiting
- Input Validation
- Audit Logs

## Scalability
Load Balancer
→ React Frontend
→ Express API
→ Redis
→ AI Service
→ PostgreSQL
→ Qdrant
→ MinIO

## Development Philosophy
Start with:
- Base Llama 3.1 8B Instruct
- RAG
- Prompt Engineering
- Structured Outputs

Fine-tune only after collecting production-quality datasets.