# Apache Kafka — rrugë evolutive (event streaming)

## Status

**Broker Kafka nuk është i detyrueshëm** për Car Dealership MVP. Mesazhet asinkrone përdorin **RabbitMQ** ose bus lokal (`../messageBus.js`).

## Kur të përdoret Kafka

| Skenar | Përfitimi |
|--------|-----------|
| Shumë konsumatorë të një ngjarjeje | `purchase.completed` → email, analytics, audit |
| Replay / audit log i ngjarjeve | Ruan historikun e domain events |
| Throughput i lartë | Raporte në kohë reale |

## Krahasim me RabbitMQ (implementuar)

| | RabbitMQ (ky repo) | Kafka (plan) |
|---|-------------------|--------------|
| Model | Queue / topic exchange | Partitioned log |
| Përdorim këtu | `users.password_reset_requested`, test events | — |
| Compose | `docker-compose.gateway.yml` | Shto `confluentinc/cp-kafka` në fazën e ardhshme |

## Shembull topic (koncept)

```
car-dealership.purchases  →  key: car_id, value: PurchaseCompleted JSON
car-dealership.inventory  →  key: car_id, value: CarListed JSON
```

## Lidhje

- [messageBus.js](../messageBus.js)
