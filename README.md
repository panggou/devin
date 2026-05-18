# OpsInsight - Internal Operations Dashboard

A containerized internal web application for managing server inventory, monitoring Kubernetes clusters, and tracking operational activities.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Users / Browser                     │
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │  (Frontend) │  Port 3000/80
                    │  React SPA  │
                    └──────┬──────┘
                           │ /api/*
                    ┌──────▼──────┐
                    │   FastAPI   │
                    │  (Backend)  │  Port 8000
                    │  REST API   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │ (Database)  │  Port 5432
                    └─────────────┘
```

## Features

- **Dashboard** - Overview of system stats, server counts, environment distribution charts
- **Server Inventory CRUD** - Create, read, update, delete server entries
- **Kubernetes Cluster Status** - Monitor cluster health, node counts, pod status, resource usage
- **CSV Upload** - Bulk import servers from CSV files
- **REST API Documentation** - Auto-generated Swagger/OpenAPI docs at `/docs`
- **Audit Logging** - Track all user actions with timestamps and details
- **Authentication** - JWT-based local username/password login

## Tech Stack

| Component  | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, TypeScript, Tailwind CSS, Vite |
| Backend    | Python, FastAPI, SQLAlchemy       |
| Database   | PostgreSQL 16                     |
| Auth       | JWT (python-jose), bcrypt         |
| Containers | Docker, Docker Compose            |
| Orchestration | Kubernetes, Helm               |
| CI/CD      | GitHub Actions                    |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/panggou/devin.git
cd devin

# Start all services
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Seed Admin User

After starting the application, create the default admin user:

```bash
curl -X POST http://localhost:8000/api/auth/seed
```

Default credentials: `admin` / `admin123`

### Local Development

#### Backend

```bash
cd backend
pip install poetry
poetry install --no-root
cp .env.example .env

# Start PostgreSQL (via Docker)
docker compose up db -d

# Run the backend
poetry run uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

#### Run Tests

```bash
# Backend tests
cd backend
TESTING=1 poetry run pytest tests/ -v

# Backend lint
poetry run ruff check app/ tests/
```

## Kubernetes Deployment

### Using kubectl

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### Using Helm

```bash
helm install opsinsight ./helm/opsinsight \
  --namespace opsinsight \
  --create-namespace \
  --set backend.env.secretKey="your-production-secret"
```

## API Endpoints

| Method | Endpoint                    | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | `/api/auth/register`        | Register new user            |
| POST   | `/api/auth/login`           | Login and get JWT token      |
| GET    | `/api/auth/me`              | Get current user profile     |
| POST   | `/api/auth/seed`            | Create default admin user    |
| GET    | `/api/dashboard`            | Get dashboard statistics     |
| GET    | `/api/servers`              | List all servers             |
| POST   | `/api/servers`              | Create a server              |
| GET    | `/api/servers/{id}`         | Get server by ID             |
| PUT    | `/api/servers/{id}`         | Update a server              |
| DELETE | `/api/servers/{id}`         | Delete a server              |
| POST   | `/api/servers/upload-csv`   | Upload CSV to import servers |
| GET    | `/api/kubernetes/clusters`  | List Kubernetes clusters     |
| GET    | `/api/kubernetes/clusters/{name}` | Get cluster details    |
| GET    | `/api/audit/logs`           | List audit logs              |
| GET    | `/api/health`               | Health check                 |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/          # Config, database, security, dependencies
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── utils/         # Utility functions (audit, CSV parser)
│   │   └── main.py        # FastAPI application entry point
│   ├── tests/             # Unit tests
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── api.ts         # API client
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── App.tsx        # Main app with routing
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                   # Kubernetes manifests
├── helm/opsinsight/       # Helm chart
├── .github/workflows/     # CI pipeline
├── docker-compose.yml
└── README.md
```

## Implementation Decisions

1. **FastAPI** - Chosen for automatic OpenAPI documentation, async support, and type validation with Pydantic
2. **SQLAlchemy ORM** - Provides database abstraction with support for PostgreSQL and SQLite (for tests)
3. **JWT Authentication** - Stateless auth with Bearer tokens, suitable for API-first applications
4. **React + Vite + Tailwind** - Modern frontend stack with fast builds and utility-first CSS
5. **SQLite for Tests** - In-memory SQLite used in tests for fast, isolated test execution without requiring PostgreSQL
6. **Audit Logging** - All mutations are tracked with user, action, resource, and timestamp for compliance
7. **Mock Kubernetes Data** - K8s cluster status uses mock data to demonstrate the UI without requiring a real cluster
8. **Nginx Reverse Proxy** - Frontend container uses Nginx to serve static files and proxy API requests to the backend
9. **Multi-stage Docker Builds** - Frontend Dockerfile uses multi-stage builds to minimize image size
10. **Helm Chart** - Provides parameterized Kubernetes deployment for production environments
