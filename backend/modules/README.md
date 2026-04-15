# Modularizimi i sistemit

Sistemi ndahet në **katër module** logjike me API publike, dokumentacion në çdo dosje `README.md`, dhe **logging** të brendshëm përmes `backend/lib/moduleLogger.js`.

| Moduli | Dosja | Prefiksi API |
|--------|-------|----------------|
| Autentikimi | [authentication](./authentication/) | `/api/auth` |
| Menaxhimi i përdoruesve | [users](./users/) | `/api/users` |
| Operacionet biznesore | [business](./business/) | `/api/cars`, `/api/contact` |
| Statistikat & raportimi | [reporting](./reporting/) | `/api/admin`, `/api/car-logs` |

Regjistrimi qendror: [registerModules.js](./registerModules.js) (thirret nga `backend/index.js`).
