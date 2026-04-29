# Integrations Layer

This folder defines integration contracts for the modular MVC architecture.

**Faza I vs Faza II:** Rrugët publike `/api/*` janë të njëjtat si në themelin e projektit (React + Axios). Këtu dokumentohet vetëm **Faza II** (registry, discovery, health); klienti nuk duhet të ndryshojë.

## Service Discovery Registry

The file `serviceRegistry.js` acts as a lightweight service discovery map for
this project. It maps internal modules to their route base:

- `authService` -> `/api/auth`
- `carsService` -> `/api/cars`
- `adminService` -> `/api/admin`
- `contactService` -> `/api/contact`
- `carLogsService` -> `/api/car-logs`

The registry is exposed through `GET /health` from `backend/index.js`.

## Health and Readiness

- `GET /health`: reports service map and process uptime.
- `GET /ready`: verifies database readiness (`MySQL`) and includes `MongoDB`
  connection state.

## Minimal API Gateway + Registry setup (simple and optional)

For coursework requirements, this repo now includes a lightweight setup that
does not change existing app routes:

- **API Gateway**: Nginx config at `deploy/nginx/api-gateway.conf`
  (forwards all requests to backend).
- **Service Registry**: internal registry in code (`serviceRegistry.js`) and
  optional Consul container in `docker-compose.gateway.yml`.

### Quick start

1. Keep your existing `backend/.env` values.
2. Run:
   - `docker compose -f docker-compose.gateway.yml up`
3. Access:
   - Gateway: `http://localhost:8080`
   - Health through gateway: `http://localhost:8080/health`
   - Readiness through gateway: `http://localhost:8080/ready`
   - Consul UI: `http://localhost:8500`
   - RabbitMQ UI: `http://localhost:15672` (user: `guest`, pass: `guest`)

This is intentionally minimal so the current project behavior remains the same.

## Inter-service communication (minimal implementation)

### 1) Asynchronous messaging (RabbitMQ with local fallback)

- File: `backend/integrations/messageBus.js`
- Modes:
  - `MESSAGE_BROKER=local` (default, no extra software)
  - `MESSAGE_BROKER=rabbitmq` (uses `RABBITMQ_URL`)
- Example event in code:
  - `users.password_reset_requested` emitted from user service.

Test endpoints:
- `GET /api/v1/integrations/messaging/status`
- `POST /api/v1/integrations/messaging/test-event`

### 1.1) Strategic caching (Redis with memory fallback)

- Cache middleware: `backend/middleware/cache.js`
- Current car endpoints already cached via `apicache`.
- Modes:
  - default memory cache
  - Redis cache if `REDIS_URL` is set (e.g. `redis://localhost:6379`)

### 2) Synchronous modular calls (REST)

- File: `backend/integrations/internalApiClient.js`
- Calls internal endpoint `/api/v1/health` via HTTP.

### 3) Circuit Breaker (fault tolerance)

- File: `backend/lib/circuitBreaker.js`
- Wrapped endpoint:
  - `GET /api/v1/integrations/sync/health-through-breaker`
- Tunable env vars:
  - `CB_FAILURE_THRESHOLD` (default `3`)
  - `CB_COOLDOWN_MS` (default `15000`)
  - `CB_REQUEST_TIMEOUT_MS` (default `4000`)

## API Rate Limiting

- Global limiter: `app.use("/api", apiLimiter)`
- Stricter auth limiter:
  - `/api/auth/login`
  - `/api/auth/register`
- Password reset limiter:
  - `/api/users/password/reset/request`

Env configuration:
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX`
- `PASSWORD_RESET_RATE_LIMIT_WINDOW_MS`, `PASSWORD_RESET_RATE_LIMIT_MAX`

## Extended architecture (description only — not implemented in this repo)

This monolith uses HTTP (`/api/*`) and an internal registry in code
[`serviceRegistry.js`](serviceRegistry.js). In a **multi-service** enterprise
system, the same ideas scale differently:

| Mechanism | Typical use | Relation to this project |
|-----------|-------------|---------------------------|
| **RabbitMQ** | Work queues, pub/sub between services (e.g. “new car listed” → email worker) | Not installed; would replace ad-hoc HTTP calls between services with durable messages. |
| **Apache Kafka** | Event streaming, log of domain events, high throughput | Not installed; would feed analytics or multiple consumers from one event stream. |
| **gRPC** | Fast RPC between internal services with strict contracts (protobuf) | Not installed; REST/JSON is enough here; gRPC is often used service-to-service behind an API gateway. |

**No extra software** (RabbitMQ, Kafka brokers, gRPC servers) is required to run
the Car Dealership app. The above is **documentation** for coursework that asks
for enterprise messaging and RPC concepts, linked to how the current code
centralizes routes and discovery in one place.
