# Moduli: Statistikat & Raportimi (Statistics & reporting)

## Përmbledhje

Dashboard admin, grafika, blerje/trade-in, menaxhim test-drive, panel menaxheri, fatura PDF, logje aktiviteti veturash (Mongo).

## Interfaqe publike (API)

### Admin — `/api/admin` (JWT + rol `admin`)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/admin/stats` | Numërues (users, cars, contacts, …) |
| GET | `/api/admin/charts` | Të dhëna grafikësh + revenue |
| GET | `/api/admin/analytics` | Snapshot analitik |
| GET | `/api/admin/purchases` | Lista blerjesh + trade-in |
| GET | `/api/admin/contacts` | Inbox Mongo |
| GET | `/api/admin/test-drives` | Të gjitha kërkesat |
| PATCH | `/api/admin/test-drives/:id/status` | Ndryshim statusi |
| GET | `/api/admin/cars-inventory` | Inventar i plotë |
| GET | `/api/admin/audit-logs` | Audit trail |

### Manager — `/api/manager` (JWT + `manager` ose `admin`)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/manager/overview` | Metrika + 5 blerjet e fundit |
| GET | `/api/manager/trade-ins/pending` | Trade-in në pritje |
| PATCH | `/api/manager/trade-ins/:purchaseId/decision` | Approve / reject |
| GET | `/api/manager/invoices/:purchaseId` | Payload fature |
| GET | `/api/manager/invoices/:purchaseId/pdf` | Shkarkim PDF |

### Logje — `/api/car-logs` (admin)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/car-logs` | ~100 hyrjet e fundit (Mongo) |

**v1:** `/api/v1/admin/*`, `/api/v1/manager/*`, `/api/v1/car-logs`

## Abstraksione

- **Eksporton:** lexim agreguar, raporte, vendime trade-in  
- **Nuk modifikon:** katalog veturash direkt (përdor PATCH sold-out përmes admin që thërret routes cars)  
- **Përdor:** `BusinessLogicService` për analytics/overview  

## Skedarë kryesorë

- `backend/routes/adminRoutes.js`, `managerRoutes.js`, `carLogRoutes.js`
- `backend/controllers/adminController.js`
- `backend/services/invoicePdfService.js`
- `backend/modules/reporting/index.js` (3 mount: admin, manager, car-logs)

## Logging & monitoring

| Ngjarje | Kanal |
|---------|-------|
| `stats_read` | `module:reporting` |
| `car_logs_read` | `module:reporting` |
| `contact_inbox_read` | `module:reporting` |

Monitoring: Grafana/Loki në `docker-compose.gateway.yml` (opsional).
