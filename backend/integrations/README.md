# Integrations Layer

Gateway, discovery, messaging, circuit breaker, cache.

## Service Discovery
| Layer | File | Role |
|-------|------|------|
| In-process | `serviceRegistry.js` | Module → routes (always on) |
| External | `consulRegistry.js` | Consul register/discover when `CONSUL_ENABLED=true` |

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/integrations/discovery` | Registry + manifest + layers |
| `GET /api/v1/integrations/consul/services` | Healthy instances from Consul |

## API Gateway

- Config: `deploy/nginx/api-gateway.conf`
- Compose: `docker-compose.gateway.yml` → http://localhost:8080

## Messaging (RabbitMQ + local)

- File: `messageBus.js`
- `MESSAGE_BROKER=local` | `rabbitmq` + `RABBITMQ_URL`
- Test: `POST /api/v1/integrations/messaging/test-event`

## Sync REST + Circuit Breaker

- `internalApiClient.js` + `lib/circuitBreaker.js`
- Demo: `GET /api/v1/integrations/sync/health-through-breaker`

## Caching & rate limits

- Redis: `REDIS_URL` → `middleware/cache.js`
- App limits: `middleware/rateLimiter.js`
- Gateway limits: Nginx `limit_req` in `api-gateway.conf`

## gRPC / Kafka (evolution)

- `grpc/car_dealership.proto` + README
- `kafka/README.md`
