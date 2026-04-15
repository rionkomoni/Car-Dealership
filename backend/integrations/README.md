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

