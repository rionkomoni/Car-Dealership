# Moduli: Autentikimi (Authentication)

## Përmbledhje

Regjistrim dhe kyçje me JWT; fjalëkalimet ruhen të hash-uara në MySQL.

## API publike (HTTP)

| Metoda | Rruga | Përshkrim |
|--------|-------|-----------|
| POST | `/api/auth/register` | Krijon përdorues `client` |
| POST | `/api/auth/login` | Kthen JWT + objekt `user` |

## Skedarë kryesorë

- Rrugët: `backend/routes/authRoutes.js`
- Controller: `backend/controllers/authController.js`
- Service: `backend/services/authService.js`
- Repository: `backend/repositories/userRepository.js`

## Logging / monitoring

- Ngjarje: `register_ok`, `login_ok` përmes `backend/lib/moduleLogger.js` (prefiks `module:authentication` në konsolë).
- Gateway global: `backend/middleware/apiGateway.js` (request-id, rate limit, log i kërkesave).
