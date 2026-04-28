# Moduli: Menaxhimi i përdoruesve (User management)

## Përmbledhje

CRUD për përdoruesit (admin), aktivizim i llogarisë me token (link i dërguar me email),
si dhe ndryshim i fjalëkalimit me verifikim (current password).

## API publike (HTTP)

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| GET | `/api/users/me` | JWT | Profili nga token (pa fjalëkalim) |
| POST | `/api/users/activation/request` | Public | Krijon token aktivizimi dhe dërgon email për aktivizim |
| GET | `/api/users/activate?token=...` | Public | Aktivizon llogarinë |
| POST | `/api/users/me/password` | JWT | Ndryshim password me verifikim |
| GET | `/api/users` | Admin | Lista `id, name, email, role, is_active` |
| GET | `/api/users/:id` | Admin | Detaje user (safe) |
| POST | `/api/users` | Admin | Krijo user |
| PUT | `/api/users/:id` | Admin | Përditëso user |
| DELETE | `/api/users/:id` | Admin | Fshi user |

## Skedarë kryesorë

- `backend/routes/userRoutes.js`
- `backend/controllers/userController.js`
- `backend/services/userService.js`
- `backend/repositories/userRepository.js` (`listUsersSafe`)

## Logging / monitoring

- Ngjarje: `profile_read`, `admin_list`, `admin_create`, `admin_update`, `admin_delete` përmes `moduleLogger` (`module:users`).

## SMTP konfigurimi (opsional, por rekomandohet)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
- `SMTP_FROM` (opsional)
- `PUBLIC_API_URL` (p.sh. `http://localhost:5000`) për linkun e aktivizimit
- `EXPOSE_ACTIVATION_LINK=true` vetëm për development/testing (opsional)
