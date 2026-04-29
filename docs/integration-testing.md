# Integration Testing (Simple Setup)

This project now includes two lightweight integration-testing options:

## 1) Frontend-Backend API checks with Postman/Newman

Files:
- `tests/postman/Car-Dealership.postman_collection.json`
- `tests/postman/local.postman_environment.json`

Run:

```bash
npm run test:integration:newman
```

Prerequisite:
- Backend must be running on `http://localhost:5000` (or change `baseUrl` in environment file).

## 2) Dockerized test environment with Testcontainers

File:
- `tests/testcontainers.environment.integration.test.js`

Run:

```bash
npm run test:integration:testcontainers
```

Prerequisite:
- Docker Desktop running.

This test starts Redis and RabbitMQ containers and verifies that ports are exposed.
It is isolated and does not affect existing app code.
