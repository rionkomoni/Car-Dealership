# Moduli: Menaxhimi i Përdoruesve (User management)

## Përmbledhje

Profil i përdoruesit të kyçur, wishlist, blerjet dhe test-drive të mia, aktivizim llogarie, reset/ndryshim fjalëkalimi, CRUD përdoruesish (admin).

## Interfaqe publike (API)

### Përdoruesi i kyçur

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/users/me` | JWT | Profili nga token |
| GET | `/api/users/me/purchases` | JWT | Blerjet e mia |
| GET | `/api/users/me/test-drives` | JWT | Test-drive të mia |
| GET | `/api/users/me/wishlist` | JWT | Lista e dëshirave |
| POST | `/api/users/me/wishlist/sync` | JWT | Merge IDs lokale → DB |
| POST | `/api/users/me/wishlist/:carId` | JWT | Shto në wishlist |
| DELETE | `/api/users/me/wishlist/:carId` | JWT | Hiq nga wishlist |
| POST | `/api/users/me/password` | JWT | Ndryshim fjalëkalimi |

### Publike / aktivizim

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| POST | `/api/users/activation/request` | Dërgon link aktivizimi |
| GET | `/api/users/activate?token=` | Aktivizon llogarinë |
| POST | `/api/users/password/reset/request` | Email reset |
| POST | `/api/users/password/reset/confirm` | Password i ri me token |

### Admin

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET/POST | `/api/users` | Admin | Listo / krijo |
| GET/PUT/DELETE | `/api/users/:id` | Admin | Lexo / përditëso / fshi |

**v1:** `/api/v1/users/*`

## Abstraksione

- **Eksporton:** identitet përdoruesi, wishlist, self-service password  
- **Nuk eksporton:** logjikë blerjeje (moduli biznesi), grafika admin (moduli raportimi)  
- **Event:** `users.password_reset_requested` → `messageBus.js`  

## Skedarë kryesorë

- `backend/routes/userRoutes.js`
- `backend/controllers/userController.js`
- `backend/services/userService.js`
- `backend/repositories/userRepository.js`, `wishlistRepository.js`
- `backend/modules/users/index.js`

## Logging & monitoring

Ngjarje `module:users` (përmes `userController.js`):

`profile_read`, `my_purchases`, `my_test_drives`, `wishlist_list`, `wishlist_add`, `wishlist_remove`, `wishlist_sync`, `admin_list`, `admin_create`, `admin_update`, `admin_delete`, plus `logModuleError` për gabime.

## Email (opsional)

`EMAIL_PROVIDER`, SMTP/SendGrid/Mailtrap — shiko variablat në README të mëparshëm të projektit.
