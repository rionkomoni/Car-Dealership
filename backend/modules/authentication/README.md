# Moduli: Autentikimi (Authentication)

## Përmbledhje

Regjistrim, kyçje, refresh token dhe logout. Fjalëkalimet ruhen të hash-uara (bcrypt) në MySQL. JWT për thirrjet e mbrojtura.

## Interfaqe publike (API)

| Metoda | Rruga | Auth | Përshkrim |
|--------|-------|------|-----------|
| POST | `/api/auth/register` | Jo | Krijon përdorues `client` |
| POST | `/api/auth/login` | Jo | JWT + `refreshToken` + `user` |
| POST | `/api/auth/refresh` | Jo | Token i ri nga refresh |
| POST | `/api/auth/logout` | Jo | Revokon refresh token |

Versioni **v1:** `/api/v1/auth/*` (i njëjti router).

## Abstraksione (çfarë eksporton)

- **Hyrje:** email + password  
- **Dalje:** `token` / `accessToken`, `refreshToken`, `user { id, name, email, role }`  
- **Nuk menaxhon:** inventar veturash, wishlist, statistika admin  

## Skedarë kryesorë

| Shtresa | Skedar |
|---------|--------|
| Routes | `backend/routes/authRoutes.js` |
| Controller | `backend/controllers/authController.js` |
| Service | `backend/services/authService.js` |
| Repository | `backend/repositories/userRepository.js`, `authTokenRepository.js` |
| Mount | `backend/modules/authentication/index.js` |

## Logging & monitoring

| Ngjarje | Kanal | Kur |
|---------|-------|-----|
| `register_ok` | `module:authentication` | Regjistrim i suksesshëm |
| `login_ok` | `module:authentication` | Kyçje e suksesshme |
| `module_mount` | `module:authentication` | Nisje serveri |
| Audit DB | `auditLogRepository` | Login fail/success |

Skedari logger: `backend/lib/moduleLogger.js` → `backend/logs/application.log`

Rate limit: `authLimiter` në login/register (`backend/middleware/rateLimiter.js`).

