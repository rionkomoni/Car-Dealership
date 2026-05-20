# Moduli: Operacionet Biznesore (Business operations)

## Përmbledhje

Inventari i veturave (MySQL), blerje me trade-in, test-drive, kontakt (MongoDB), ngarkim imazhesh, HATEOAS në listim/detaj.

## Interfaqe publike (API)

### Veturat — `/api/cars`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/cars` | Jo | Listë + filtra + HATEOAS + cache |
| GET | `/api/cars/:id` | Jo | Detaj + `_links` |
| POST | `/api/cars` | Admin | Krijim |
| PUT | `/api/cars/:id` | Admin | Përditësim |
| PATCH | `/api/cars/:id/sold-out` | Admin | Shitur / disponueshëm |
| DELETE | `/api/cars/:id` | Admin | Fshirje |
| POST | `/api/cars/:id/purchase` | JWT | Blerje + trade-in |
| POST | `/api/cars/:id/test-drive` | JWT | Rezervim provë |

### Kontakt — `/api/contact`

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| POST | `/api/contact` | Jo | Mesazh i ri (Mongo) |
| GET | `/api/contact` | Admin | Inbox |

### Ngarkime — `/api/uploads` (admin)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| POST | `/api/uploads/car-image` | Një foto |
| POST | `/api/uploads/car-images` | Galeri (max 12) |

**v1:** `/api/v1/cars`, `/api/v1/contact`

## Abstraksione (DDD)

| Shtresa | Vendndodhja |
|---------|-------------|
| Domain | `backend/domain/entities/` (`InventoryCar`, `PurchaseQuote`, …) |
| Application | `backend/application/services/BusinessLogicService.js` |
| Interface | `routes/`, `controllers/carController.js` |
| Persistence | `repositories/carRepository.js`, `purchaseRepository.js` |

**Eksporton:** katalog, blerje, kontakt. **Nuk eksporton:** stats dashboard (raportimi).

## Skedarë kryesorë

- `backend/routes/carRoutes.js`, `contactRoutes.js`, `uploadRoutes.js`
- `backend/lib/hateoas.js`
- `backend/modules/business/index.js`

## Logging & monitoring

| Ngjarje | Modul |
|---------|-------|
| `car_create`, `car_update`, `car_delete` | `businessOperations` (carController) |
| `contact_create` | `businessOperations` (contactRoutes) |
| Car view/purchase logs | Mongo `carLogService` |

Cache: `middleware/cache.js` + `apicache` në GET cars.

- [HATEOAS](../../lib/hateoas.js)
