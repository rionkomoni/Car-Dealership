# Car Dealership

Platformë full-stack për autosallon: **React** (frontend) + **Express** (backend) + **MySQL** + **MongoDB**.

## Nisja lokale

1. Ndiz **MySQL** (XAMPP) dhe **MongoDB** (opsional por rekomandohet).
2. Krijo `backend/.env` (JWT, MySQL, Mongo URI).
3. Instalo varësitë:

```bash
npm install
cd frontend && npm install && cd ..
```

4. **Backend** (rrënja e projektit):

```bash
npm run dev
```

→ http://localhost:5000 · Swagger: http://localhost:5000/api-docs

5. **Frontend**:

```bash
cd frontend
npm start
```

→ http://localhost:3000

### Kredenciale default (pas seed)

| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@gmail.com` | `12345678` |
| Manager | `manager@gmail.com` | `12345678` |

## Teste

```bash
npm run lint
npm test
npm run test:coverage
npm run test:integration:newman    # backend :5000 aktiv
npm run test:e2e:run               # frontend + backend
npm run test:performance
npm run qa:full
```

## Docker

```bash
docker build -f backend/Dockerfile -t car-dealership-backend .
docker build -f frontend/Dockerfile -t car-dealership-frontend .
docker compose -f docker-compose.gateway.yml up -d
```

Gateway: http://localhost:8080 · Grafana: http://localhost:3001

## Kubernetes & CI/CD

- Manifeste: `k8s/` · Helm: `helm/car-dealership/`
- Pipeline: `.github/workflows/ci-cd.yml`

## API & monitoring

| URL | Përshkrim |
|-----|-----------|
| `/api-docs` | Swagger UI |
| `/health` | Liveness |
| `/ready` | Readiness (MySQL + Mongo) |
| `/status` | Dashboard live |
| `/metrics` | Prometheus |

## Struktura

- `backend/` — API Express, module, repositories
- `frontend/` — React SPA
- `tests/` — Jest, Postman, performance
- `cypress/` — E2E

Module README: `backend/modules/*/README.md`
