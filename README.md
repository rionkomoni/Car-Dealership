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

## Render deployment

- Konfigurimi për Render është në `render.yaml`
- Backend: `car-dealership-backend`
- Frontend: `car-dealership-frontend`
- Custom domain në Render mund të konfigurohet pas deploy
- Në frontend vendos `REACT_APP_API_URL` në URL-në e backend-it të Render

### Si të përdorësh Render

1. Regjistrohu në https://render.com
2. Krijo një projekt nga GitHub dhe zgjidh branch `main`
3. Përdor `render.yaml` për të krijuar shërbimet:
   - `car-dealership-backend` (web service)
   - `car-dealership-frontend` (static site)
4. Shto sekretet në tab-in `Environment` të backend:
   - `MONGO_URI`
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DB`
   - `JWT_SECRET`
5. Në `car-dealership-frontend` vendos `REACT_APP_API_URL` për adresën reale të backend-it
6. Për domain personal, shto `Custom Domain` në secilin service dhe ndiq udhëzimet e Render

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
