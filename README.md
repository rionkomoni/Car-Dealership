# Car Dealership

Projekti lidh **Fazën I** (teknologjitë dhe integrimi) me **Fazën II** (arkitekturë e shtresuar) pa ndryshuar URL-të publike të API-së — frontend-i vazhdon të përdorë të njëjtat thirrje `axios` te `/api/*`.

## Faza II - Checklist (i implementuar)

- Arkitekturë e shtresuar me module: authentication, users, business, reporting.
- API versionim dhe health: `/api/v1/*`, `/api/v1/health`.
- OpenAPI 3.0 në `backend/docs/openapi.js` dhe Swagger UI te `/api-docs`.
- JWT auth, rate limiting, caching dhe HATEOAS në endpoint-et e makinave.
- Rrjedhë blerjeje me trade-in: `POST /api/cars/:id/purchase` (markon automatikisht `sold_out`).
- Menaxhim admin: `PATCH /api/cars/:id/sold-out`, `GET /api/admin/stats`, `GET /api/admin/purchases`.
- Unit + integration tests në `tests/` (auth middleware, health/docs, phase2 endpoints).

## Faza 7 - Modelimi i bazës së të dhënave

- ERD me relacione 1:N dhe 1:1 (`users`, `cars`, `purchases`).
- Constraints të avancuara: `CHECK`, `DEFAULT`, `UNIQUE`, `FOREIGN KEY`.
- `ON DELETE CASCADE` për marrëdhënien `cars -> purchases`.
- Indekse të optimizuara për listing, filtering dhe manager review queue.
- Stored procedure + triggers për logjikë në nivel DB.
- Modelim NoSQL me embedded entities + strategji denormalizimi/shardimi/konsistence.

Dokumenti i plotë: [docs/database-modeling-phase7.md](docs/database-modeling-phase7.md)

## 3. Frameworks & Teknologjitë (përputhje me rubrikën)

| Kërkesë | Si implementohet në këtë projekt |
|--------|-----------------------------------|
| Backend enterprise (një nga: Spring Boot, Django/DRF, **Express.js**) | **Express.js** (Node.js) — `backend/` |
| Frontend (një nga: **React**, Angular, Vue) | **React.js** — `frontend/` |
| Routing dinamik | **React Router** — rrugë si `/cars/:id`, `/login`, etj. |
| State management (Redux / Vuex) | **Redux Toolkit** — `frontend/src/store/` (`authSlice`, `store`) — `token` dhe `user` |
| RabbitMQ / Kafka (mesazhe ndër-shërbim) | **Jo në kod** (monolith me REST). Përshkrim në [backend/integrations/README.md](backend/integrations/README.md) — si do përdoreshin në sistem me shërbime të shumta |
| gRPC (performancë e lartë) | **Jo në kod** (klienti përdor HTTP/JSON). **Përshkrim** i njëjtë si më sipër |

Nuk është e nevojshme të përdoren të gjitha backend-et në listë — zgjedhja është **një** stack; këtu: **Express + React**.

## 4. Modularizimi i sistemit

Katër module të pavarura logjikisht, me **API publike**, **dokumentim teknik** (`README.md` në çdo modul), dhe **logging/monitoring** të brendshëm (`backend/lib/moduleLogger.js` + gateway global).

| Moduli | API kryesore | Dokumentacion |
|--------|--------------|---------------|
| Autentikimi | `/api/auth` | [backend/modules/authentication/README.md](backend/modules/authentication/README.md) |
| Menaxhimi i përdoruesve | `/api/users/me`, `/api/users` (admin) | [backend/modules/users/README.md](backend/modules/users/README.md) |
| Operacionet biznesore | `/api/cars`, `/api/contact` | [backend/modules/business/README.md](backend/modules/business/README.md) |
| Statistikat & raportimi | `/api/admin`, `/api/car-logs` | [backend/modules/reporting/README.md](backend/modules/reporting/README.md) |

Regjistrimi qendror i rrugëve: [backend/modules/registerModules.js](backend/modules/registerModules.js) — përmbledhje: [backend/modules/README.md](backend/modules/README.md).

## Stack (Faza I — themeli)

| Shtresa | Teknologji |
|--------|------------|
| Frontend | React, React Router, Axios, **Redux Toolkit** (gjendja e kyçjes: token + user) |
| Backend | Express, JWT, Joi |
| SQL | MySQL (`mysql2`) — përdoruesit dhe veturat |
| NoSQL | MongoDB + Mongoose — kontakt, logje veturash |

- **Frontend**: `frontend/` — `npm start` (proxy te `http://localhost:5000` nëse është konfiguruar).
- **Backend**: rrënja — `npm start` ose `npm run dev` — dëgjon në `PORT` (default **5000**).
- **Klienti API**: [frontend/src/api.js](frontend/src/api.js) — `Authorization: Bearer <token>` për rrugët e mbrojtura.

## Arkitektura (Faza II — shtresa)

Backend-i organizohet kështu (e njëjta kontratë HTTP si më parë):

```mermaid
flowchart LR
  subgraph phase1 [Faza_I_Client]
    React[React]
    Axios[Axios]
  end
  subgraph phase2 [Faza_II_Server]
    GW[Gateway_middleware]
    Routes[routes]
    Ctrl[controllers]
    Svc[services]
    Repo[repositories]
    DB[(MySQL)]
    MG[(MongoDB)]
  end
  React --> Axios
  Axios -->|"GET_POST_/api"| GW
  GW --> Routes
  Routes --> Ctrl
  Ctrl --> Svc
  Svc --> Repo
  Repo --> DB
  Svc --> MG
```

| Rruga API (e pandryshuar) | Ku shkon në Fazën II |
|---------------------------|----------------------|
| `/api/auth/*` | `routes` → `authController` → `authService` → `userRepository` |
| `/api/cars/*` | `routes` → `carController` → `carService` → `carRepository` (+ logje Mongo) |
| `/api/admin/stats` | `routes` → `adminController` → `adminService` → repos SQL + Mongo |
| `/api/contact`, `/api/car-logs` | routes ekzistuese (contact / logs) |

### API Gateway Light

Në [backend/index.js](backend/index.js):

- `x-request-id`, rate limit in-memory, logging i thirrjeve.

### Service Discovery dhe shëndeti

- Registry: [backend/integrations/serviceRegistry.js](backend/integrations/serviceRegistry.js)
- `GET /health` — registry + uptime
- `GET /ready` — MySQL + MongoDB

### Rrjedhat e refaktoruara eksplicit në MVC të shtresuar

- Auth (`/api/auth`)
- Cars CRUD (`/api/cars`)
- Admin stats (`/api/admin/stats`)

Më shumë: [backend/integrations/README.md](backend/integrations/README.md).

## Si të nisësh (pa prishje)

1. Nis MySQL dhe MongoDB (sipas mjedisit tënd).
2. Konfiguro `backend/.env` (JWT, MySQL, Mongo URI).
3. Nga rrënja: `npm start` (backend).
4. Në `frontend/`: `npm start` (React).

Nëse `REACT_APP_API_URL` nuk është vendosur, CRA proxy (nëse ekziston në `frontend/package.json`) dërgon `/api` te backend-i lokal.

## Çfarë të instalosh për të punuar në projekt (mjedis real)

Këto **nuk** janë RabbitMQ/Kafka — janë mjetet që i duhen **këtij** repo për të ekzekutuar kodin:

| Aplikacion / mjet | Pse |
|-------------------|-----|
| **Node.js** (LTS) | `npm`, backend Express, build i React-it. |
| **Git** | versionim, commit, push në GitHub. |
| **MySQL** | të dhënat relacionale (users, cars). Me **XAMPP** merr edhe MySQL + phpMyAdmin; ose MySQL Community nëse nuk përdor XAMPP. |
| **MongoDB Community Server** (ose MongoDB Atlas në cloud) | kontaktet dhe logjet; pa Mongo, disa pjesë kthejnë bosh ose 503. |
| **Editor** (Cursor / VS Code) | shkrimi i kodit — opsional por praktik. |

Opsionale: **Postman** ose **Thunder Client** për të testuar `GET/POST` te `http://localhost:5000/api/...`.

**Nuk duhet të instalosh** RabbitMQ, Kafka apo kompilator gRPC për të ekzekutuar këtë projekt — ato janë të përmendura vetëm në **përshkrim arkitekture** (shih më poshtë dhe [backend/integrations/README.md](backend/integrations/README.md)).

## Kërkesë akademike: komunikim ndër-shërbim (vetëm përshkrim, jo në kod)

Në një sistem me **shërbime të shumta** (jo në këtë monolith), zakonisht përdoren:

- **RabbitMQ** ose **Apache Kafka** për radha mesazhesh (evente, punë asinkrone).
- **gRPC** për thirrje të shpejta mes shërbimeve me kontratë të fortë (protobuf).

Për këtë repo, **lidhja me kodin** është vetëm në kuptimin e **kontratës**: `serviceRegistry` + `/health` në Express janë **ekuivalenti i lehtë** i “discovery” brenda një aplikacioni; në një sistem të zgjeruar, shërbimet do regjistroheshin te një broker/registry dhe do komunikonin me Kafka/RabbitMQ/gRPC. Përshkrimi i plotë: [backend/integrations/README.md](backend/integrations/README.md).
