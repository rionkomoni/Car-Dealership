# Moduli: Statistikat dhe raportimi (Statistics & reporting)

## Përmbledhje

Numërues për përdorues/vetura/kontakte, inbox kontimesh për admin, histori logjesh veturash (Mongo).

## API publike (HTTP)

### Admin — `/api/admin` (kërkon JWT + rol `admin`)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/admin/stats` | `users`, `cars`, `contactsMongo` |
| GET | `/api/admin/contacts` | Lista e mesazheve (Mongo) |

### Logje — `/api/car-logs` (admin)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| GET | `/api/car-logs` | Deri në 100 hyrje së fundmi |

## Skedarë kryesorë

- `backend/routes/adminRoutes.js`
- `backend/controllers/adminController.js`
- `backend/services/adminService.js`
- `backend/routes/carLogRoutes.js`

## Logging / monitoring

- `stats_read`, `car_logs_read`, `contact_inbox_read` përmes `moduleLogger` (`module:reporting` në mesazh).
