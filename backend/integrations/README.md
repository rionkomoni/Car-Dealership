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
