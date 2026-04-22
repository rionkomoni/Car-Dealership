# Moduli: Statistikat dhe raportimi (Statistics & reporting)

## Përmbledhje

Numërues për përdorues/vetura/kontakte, inbox kontimesh për admin, histori logjesh veturash (Mongo).

## API publike (HTTP)

### Admin — `/api/admin` (kërkon JWT + rol `admin`)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/admin/stats` | `users`, `cars`, `contactsMongo` |
| GET | `/api/admin/contacts` | Lista e mesazheve (Mongo) |
| GET | `/api/admin/purchases` | Lista e blerjeve dhe trade-in |

### Manager — `/api/manager` (kërkon JWT + rol `manager` ose `admin`)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/manager/overview` | Overview operativ: total/sold/available/purchases + 5 blerjet e fundit |
| GET | `/api/manager/trade-ins/pending` | Lista e trade-ins në pritje për review |
| PATCH | `/api/manager/trade-ins/:purchaseId/decision` | Vendim `approved/rejected` + shënim menaxheri |

### Logje — `/api/car-logs` (admin)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/car-logs` | Deri në 100 hyrje së fundmi |

## Skedarë kryesorë

- `backend/routes/adminRoutes.js`
- `backend/routes/managerRoutes.js`
- `backend/controllers/adminController.js`
- `backend/services/adminService.js`
- `backend/routes/carLogRoutes.js`

## Logging / monitoring

- `stats_read`, `car_logs_read`, `contact_inbox_read` përmes `moduleLogger` (`module:reporting` në mesazh).
