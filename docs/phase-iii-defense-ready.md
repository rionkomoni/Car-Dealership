# Car Dealership - Fazat e Implementimit dhe Verifikimit (Phase III)

Ky dokument eshte pergatitur ne format te gatshem per mbrojtje dhe dorezim.  
Mund te kopjohet direkt ne Word.

---

## 1. Qellimi i Fazes III

Ne Fazen III, projekti fokusohet ne:
- testim te plote (unit, integration, E2E, performance),
- hardening te sigurise ne API,
- observability (health, ready, metrics, status),
- integrime bazike enterprise (service registry, message bus, circuit breaker),
- CI/CD dhe gatishmeri deploy (Docker, Kubernetes, Helm).

---

## 2. Ku ndodhen pikat kryesore ne kod

### 2.1 Testim dhe validim
- Skriptet kryesore te testimit: `package.json`
  - `test:coverage`
  - `test:integration:newman`
  - `test:e2e:run`
  - `test:performance`
  - `test:performance:1k`
  - `qa:full`
- Jest tests: `tests/api.integration.test.js`, `tests/phase2.endpoints.integration.test.js`, `tests/auth.middleware.unit.test.js`, `tests/domain.entities.unit.test.js`, `tests/circuitBreaker.unit.test.js`
- Postman/Newman: `tests/postman/Car-Dealership.postman_collection.json`, `tests/postman/local.postman_environment.json`
- Cypress E2E: `cypress/e2e/core-flow.cy.js`, `cypress/e2e/full-user-scenarios.cy.js`
- Performance load test (Autocannon): `tests/performance/load-test.js`

### 2.2 Siguria (Security hardening)
- Helmet, XSS sanitization, HTTPS redirect policy: `backend/index.js`
- Sanitizimi i input-eve (body/query/params): `backend/middleware/securitySanitizer.js`
- Rate limiting (API/Auth/Password reset): `backend/middleware/rateLimiter.js`
- JWT auth middleware: `backend/middleware/auth.js`
- Role authorization:
  - `backend/middleware/requireAdmin.js`
  - `backend/middleware/requireManagerOrAdmin.js`

### 2.3 Authentication Phase III
- Login me access token + refresh token + role claim: `backend/routes/authRoutes.js`
- Refresh token rotation dhe revokim: `backend/routes/authRoutes.js`
- Logout (revokim token): `backend/routes/authRoutes.js`
- User profile dhe password flows: `backend/routes/userRoutes.js`

### 2.4 Observability dhe monitorim
- Health endpoint: `GET /health` ne `backend/index.js`
- Readiness endpoint: `GET /ready` ne `backend/index.js`
- Prometheus metrics endpoint: `GET /metrics` ne `backend/index.js`
- Live status dashboard (`express-status-monitor`): `GET /status` ne `backend/index.js`
- Structured module logging ne file + console: `backend/lib/moduleLogger.js`
- Monitoring stack config:
  - `deploy/monitoring/loki-config.yml`
  - `deploy/monitoring/promtail-config.yml`
  - `deploy/monitoring/grafana-datasources.yml`

### 2.5 Integrime enterprise dhe reliability
- Service registry: `backend/integrations/serviceRegistry.js`
- Message bus (local + RabbitMQ fallback): `backend/integrations/messageBus.js`
- Integration endpoints (`/api/v1/integrations/...`): `backend/routes/v1/integrationRoutes.js`
- Circuit breaker implementation: `backend/lib/circuitBreaker.js`
- Circuit breaker i aplikuar ne internal API client: `backend/integrations/internalApiClient.js`

### 2.6 API versioning dhe dokumentim
- API v1 routes: `backend/routes/v1/index.js`
- Swagger/OpenAPI endpoint: `/api-docs` i montuar ne `backend/index.js`
- OpenAPI spec: `backend/docs/openapi.js`

### 2.7 Deploy dhe infrastructure
- Docker backend image: `backend/Dockerfile`
- Docker frontend image: `frontend/Dockerfile`
- Compose me gateway + observability + infra: `docker-compose.gateway.yml`
- Kubernetes manifests: `k8s/`
- Helm chart: `helm/car-dealership/`
- CI/CD workflow: `.github/workflows/ci-cd.yml`

---

## 3. Testimet (gati per ekzekutim)

### 3.1 Komandat qe duhen ekzekutuar

Nga rruga e projektit:

```bash
npm run test:coverage
npm run test:integration:newman
npm run test:e2e:run
npm run test:performance
npm run test:performance:1k
npm run qa:full
```

### 3.2 Cfare pritet si rezultat
- `test:coverage`: te gjitha suite PASS, coverage i larte (aktualisht ~96% statements/lines dhe ~80% branches).
- `test:integration:newman`: requests dhe assertions 0 failed.
- `test:e2e:run`: Cypress specs me 0 failing.
- `test:performance`: non-2xx = 0, latency/rps brenda pragjeve te scripts.
- `test:performance:1k`: load i rende me 1000 connections, 0 non-2xx dhe pragjet minimale te script-it te plotesuara.
- `qa:full`: zinxhir i plote (coverage + E2E + performance) pa dështime.

### 3.3 Shenim i rendesishem per Docker
Nese Docker Desktop jep "Virtualization support not detected", testimet e mesiperme vazhdojne normalisht pa Docker ne mjedisin lokal (Node + DB lokale), por build/run ne Docker kerkon aktivizim virtualization ne BIOS/UEFI dhe WSL2.

---

## 4. Argumentimi i shkurter per mbrojtje

Ky projekt demonstron nje implementim praktik te Fazes III sepse:
- ka testim te automatizuar ne disa nivele (unit, integration, E2E, performance),
- zbaton masa sigurie te API-ve (helmet, sanitizim, rate limit, JWT + role checks),
- ka observability reale (`/health`, `/ready`, `/metrics`, `/status`, logging i strukturuar),
- perfshin mekanizma reliability dhe integrimi (service registry, message bus, circuit breaker),
- eshte i pergatitur per deploy modern (Docker, Kubernetes, Helm, CI/CD).

---

## 5. Pyetje tipike nga profesori dhe pergjigje te shkurtra

1. **Ku e ke vertetuar cilesine e kodit?**  
   Te `package.json` me skriptet `test:coverage`, `test:e2e:run`, `test:performance`, dhe te dosja `tests/` + `cypress/e2e/`.

2. **Ku shihet sigurimi i API-ve?**  
   Te `backend/index.js` (helmet, sanitizer, force HTTPS policy) dhe te middleware `backend/middleware/rateLimiter.js`, `auth.js`, `requireAdmin.js`.

3. **Ku shihet observability?**  
   Endpoint-et `/health`, `/ready`, `/metrics`, `/status` ne `backend/index.js` dhe konfigurimet Loki/Promtail/Grafana ne `deploy/monitoring/`.

4. **Ku eshte pjesa enterprise/integration?**  
   Te `backend/integrations/serviceRegistry.js`, `messageBus.js`, `internalApiClient.js` dhe route `backend/routes/v1/integrationRoutes.js`.

5. **Si deployohet?**  
   Me Dockerfiles (`backend/`, `frontend/`), manifests ne `k8s/`, chart ne `helm/car-dealership/`, dhe pipeline ne `.github/workflows/ci-cd.yml`.

