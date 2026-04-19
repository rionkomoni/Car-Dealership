# Moduli: Operacionet biznesore (Business operations)

## Përmbledhje

Menaxhim inventari veturash (CRUD në MySQL), forma kontakti dhe ruajtje në MongoDB, logje aktiviteti të lidhura me vetura (Mongo) përmes `carService` / `carLogService`.

## API publike (HTTP)

### Veturat — `/api/cars`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/cars` | Jo | Lista |
| GET | `/api/cars/:id` | Jo | Detaj (+ log view në Mongo) |
| POST | `/api/cars` | JWT | Krijim |
| PUT | `/api/cars/:id` | JWT | Përditësim |
| DELETE | `/api/cars/:id` | JWT | Fshirje |

### Kontakt — `/api/contact`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| POST | `/api/contact` | Jo | Mesazh i ri |
| GET | `/api/contact` | Admin | Inbox |

## Skedarë kryesorë

- Cars: `routes/carRoutes.js`, `controllers/carController.js`, `services/carService.js`, `repositories/carRepository.js`
- Contact: `routes/contactRoutes.js`, `models/Contact.js`

## Logging / monitoring

- Vetura: `car_create`, `car_update`, `car_delete` (`module:businessOperations`).
- Kontakt: `contact_create`; inbox: `contact_inbox_read` në rrugën e kontaktit (admin).
