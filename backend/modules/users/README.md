# Moduli: Menaxhimi i përdoruesve (User management)

## Përmbledhje

Lexim profili për përdoruesin e kyçur; listë përdoruesish për administrator.

## API publike (HTTP)

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/users/me` | JWT | Profili nga token (pa fjalëkalim) |
| GET | `/api/users` | Admin | Lista `id, name, email, role` |

## Skedarë kryesorë

- `backend/routes/userRoutes.js`
- `backend/controllers/userController.js`
- `backend/services/userService.js`
- `backend/repositories/userRepository.js` (`listUsersSafe`)

## Logging / monitoring

- Ngjarje: `profile_read`, `admin_list` përmes `moduleLogger` (`module:users`).
