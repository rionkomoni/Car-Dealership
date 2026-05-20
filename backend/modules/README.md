# Modularizimi i sistemit

Katër **module të pavarura logjikisht**, secili me API publike, README teknik dhe logging përmes `moduleLogger`.

| # | Moduli | Prefiks API | Dokumentim |
|---|--------|-------------|------------|
| 1 | Autentikimi | `/api/auth` | [authentication/README.md](./authentication/README.md) |
| 2 | Përdoruesit | `/api/users` | [users/README.md](./users/README.md) |
| 3 | Biznesi | `/api/cars`, `/api/contact`, `/api/uploads` | [business/README.md](./business/README.md) |
| 4 | Raportimi | `/api/admin`, `/api/manager`, `/api/car-logs` | [reporting/README.md](./reporting/README.md) |

## Regjistrim

```javascript
// backend/modules/registerModules.js
registerApiModules(app); // log module_mount për çdo modul
```

Manifest (discovery): [moduleManifest.js](./moduleManifest.js)

## Logging

`backend/lib/moduleLogger.js` — format:

```text
[timestamp] [module:users] profile_read {"userId":2}
```

## Versionim

Të njëjtat router në `/api/v1/*` — `backend/routes/v1/index.js`.

## Shtresat

[../architecture/layerMap.js](../architecture/layerMap.js)
