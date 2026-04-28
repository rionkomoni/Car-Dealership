# Moduli: Operacionet biznesore (Business operations)

## Përmbledhje

Menaxhim inventari veturash (CRUD në MySQL), forma kontakti dhe ruajtje në MongoDB, logje aktiviteti të lidhura me vetura (Mongo) përmes `carService` / `carLogService`.

Ky modul përdor ndarje DDD:
- **Domain layer**: `backend/domain/entities`, `backend/domain/services`
- **Application layer**: `backend/application/services` (orchestrimi i use-case)
- **Interface layer**: `routes`/`controllers`

## API publike (HTTP)

### Veturat — `/api/cars`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/cars` | Jo | Lista |
| GET | `/api/cars/:id` | Jo | Detaj (+ log view në Mongo) |
| POST | `/api/cars` | JWT | Krijim |
| PUT | `/api/cars/:id` | JWT | Përditësim |
| DELETE | `/api/cars/:id` | JWT | Fshirje |

### Biznes / Analytics & Invoice

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/manager/invoices/:purchaseId` | Manager/Admin | Gjeneron invoice view nga domain service |
| GET | `/api/admin/analytics` | Admin | Snapshot analitik (revenue, trade-in outcome) |

### Kontakt — `/api/contact`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| POST | `/api/contact` | Jo | Mesazh i ri |
| GET | `/api/contact` | Admin | Inbox |

## Skedarë kryesorë

- Cars: `routes/carRoutes.js`, `controllers/carController.js`, `services/carService.js`, `repositories/carRepository.js`
- Contact: `routes/contactRoutes.js`, `models/Contact.js`
- Domain services: `domain/services/InvoiceService.js`, `domain/services/AnalyticsService.js`
- Application service: `application/services/BusinessLogicService.js`
- Data access (ORM): `dal/sequelize.js`, `dal/models.js`, `repositories/businessRepository.js` (Sequelize)

## Logging / monitoring

- Vetura: `car_create`, `car_update`, `car_delete` (`module:businessOperations`).
- Kontakt: `contact_create`; inbox: `contact_inbox_read` në rrugën e kontaktit (admin).
