# Dokumentimi i Fazes 4

## Testimi parafinal, QA, deploy dhe dokumentimi

Ky dokument pershkruan fazen e katert te projektit **Car Dealership**, nje platforme full-stack per autosallon e ndertuar me **React** ne frontend, **Node.js/Express** ne backend, **MySQL** per te dhenat relacionale dhe **MongoDB** per te dhena ndihmese/logjike te sistemit. Qellimi i fazes eshte te verifikohet cilesia para dorezimit perfundimtar, te percaktohet menyra e publikimit ne nje ambient real dhe te dokumentohet perdorimi, mirembajtja dhe arkitektura teknike.

Dokumenti eshte i ndare ne tri pjese kryesore: testimi parafinal dhe sigurimi i cilesise, deploy-i dhe ambienti i prodhimit, si dhe dokumentimi teknik e i perdorimit.

## 1. Testimi Parafinal dhe Sigurimi i Cilesise

Testimi parafinal ka per qellim te siguroje qe sistemi funksionon sakte ne skenaret kryesore, trajton gabimet ne menyre te kontrolluar, mbron te dhenat e perdoruesve dhe mund te perballoje ngarkese normale ne API. Per kete projekt perdoren testime te automatizuara dhe manuale.

### 1.1 Strategjia e Testimit

Testimi ndahet ne keto nivele:

- **Unit testing**: verifikon funksione ose module te vecanta, si autentikimi, validimi, sanitizer-i i sigurise dhe entitetet e domenit.
- **Integration testing**: verifikon komunikimin ndermjet routes, controllers, services, repositories dhe databazave.
- **End-to-end testing**: verifikon rrjedhat reale te perdoruesit ne frontend me Cypress.
- **API testing**: verifikon endpoints me Postman/Newman dhe Swagger/OpenAPI.
- **Performance testing**: perdor `autocannon` per te matur latency, requests per second dhe gabimet jo-2xx.
- **Security testing**: kontrollon XSS, SQL Injection, rate limiting, autentikim dhe autorizim.

Komandat kryesore per QA jane:

```bash
npm run lint
npm test
npm run test:coverage
npm run test:integration:newman
npm run test:e2e:run
npm run test:performance
npm run qa:full
```

`qa:full` ekzekuton mbulimin me teste, testet end-to-end dhe testimin e performances. Para ekzekutimit te Newman dhe Cypress duhet te jene aktive backend-i dhe frontend-i lokal.

### 1.2 Happy Path Tests

Skenaret kryesore qe duhet te kalojne para dorezimit jane:

1. **Hapja e platformes**: perdoruesi hap faqen kryesore, shikon listen e veturave dhe navigon ne faqet kryesore.
2. **Regjistrimi dhe login-i**: perdoruesi krijon llogari, kyçet dhe merr `accessToken` dhe `refreshToken`.
3. **Shfletimi i veturave**: perdoruesi filtron veturat sipas çmimit, vitit, tipit, karburantit dhe disponueshmerise.
4. **Detajet e vetures**: perdoruesi hap nje veture specifike dhe shikon fotot, specifikat, çmimin dhe statusin.
5. **Wishlist**: perdoruesi i autentikuar shton dhe largon vetura nga lista e deshirave.
6. **Blerja e vetures**: perdoruesi i autentikuar dergon kerkese blerjeje, sistemi e regjistron blerjen dhe e shenon veturen si te shitur.
7. **Test-drive**: perdoruesi dergon kerkese per test-drive, ndersa sistemi parandalon konfliktet per te njejtin orar.
8. **Paneli admin**: administratori menaxhon veturat, kontaktet, blerjet, audit logs dhe statistikat.
9. **Paneli manager**: manager-i shikon overview operacional, faturat dhe vendimet per trade-in.
10. **Monitorimi**: endpoints `/health`, `/ready`, `/metrics` dhe `/status` kthejne status te sakte te sistemit.

Rezultati i pritur: te gjitha skenaret perfundojne pa gabime kritike, API kthen status kodet e duhura dhe frontend-i paraqet mesazhe te qarta per perdoruesin.

### 1.3 Edge Cases

Rastet e skajshme qe duhet te verifikohen jane:

- Lista e veturave eshte bosh dhe frontend-i duhet te shfaqe gjendje bosh pa u prishur.
- `page`, `pageSize`, `minPrice`, `maxPrice` ose filtrat e tjere jepen me vlera jo normale.
- Kerkohen detaje per nje veture qe nuk ekziston.
- Tentativa per blerje kur vetura eshte tashme `sold_out`.
- Kerkesa per test-drive me orar te zene.
- Refresh token eshte i skaduar, i revokuar ose i pavlefshem.
- Roli i perdoruesit nuk perputhet me endpoint-in, per shembull klienti tenton te hyje ne admin panel.
- MongoDB ose MySQL nuk jane gati dhe `/ready` duhet te ktheje `503`.

Rezultati i pritur: sistemi nuk duhet te ktheje crash ose stack trace te brendshem. Gabimet duhet te jene te kontrolluara me kode si `400`, `401`, `403`, `404`, `409` ose `503`.

### 1.4 Negative Testing dhe Validimi i Inputeve

Validimi kryhet kryesisht me `Joi` ne backend dhe me forma te validuara ne frontend. Rastet negative perfshijne:

- Login me email te pavlefshem ose password bosh.
- Regjistrim me email ekzistues.
- Krijim veture pa `name`, `price`, `year` ose `image`.
- Çmim negativ, vit jashte intervalit te lejuar ose `gallery` me me shume se 12 foto.
- Blerje pa `buyer_name`, `buyer_email` ose `payment_method`.
- Upload i file-it te pavlefshem ose pa autorizim admin.
- Request pa token, me token te skaduar ose me rol te gabuar.

Rezultati i pritur: backend-i refuzon inputin e gabuar dhe kthen mesazh te kuptueshem, pa ndryshuar gjendjen e databazes.

### 1.5 Testimi i Performances dhe Ngarkeses

Performanca testohet me skriptin `tests/performance/load-test.js`, i cili perdor `autocannon`. Skenaret minimale jane:

- `/health` per liveness.
- `/ready` per readiness te databazave.
- `/api/v1/cars` per listen e veturave me cache.
- `/api/v1/cars?page=1&pageSize=12&availableOnly=true` per filtrat tipike.

Komande shembull:

```bash
npm run test:performance -- --paths /health,/api/v1/cars --connections 50 --duration 20 --max-latency 500 --min-rps 20
```

Per test me ngarkese me te larte:

```bash
npm run test:performance:1k
```

Kriteret e pranimit:

- `non-2xx responses = 0` per endpoints publike te shendetshme.
- Latency mesatare brenda kufirit te konfiguruar.
- Requests per second jo me pak se minimumi i percaktuar.
- Sistemi nuk duhet te humbe lidhjen me databazen dhe nuk duhet te ktheje gabime `500` gjate ngarkeses normale.

### 1.6 Testimi i Sigurise

Siguria eshte e fokusuar ne inputet, token-at dhe kontrollin e roleve.

**SQL Injection**: query-t kryesore perdorin parameter binding me `?`, ndersa inputet filtrohen dhe validohen para perdorimit. Duhet te testohen payloads si `' OR '1'='1`, `1; DROP TABLE cars` dhe stringje te ngjashme ne search, login dhe filters.

**XSS**: middleware `securitySanitizer` pastron `body`, `query` dhe `params` duke hequr script tags dhe event handlers. Testet duhet te provojne payloads si `<script>alert(1)</script>` dhe `<img src=x onerror=alert(1)>`.

**CSRF**: sistemi perdor JWT Bearer tokens ne header `Authorization`, jo cookie session si mekanizem kryesor. Rreziku CSRF eshte me i ulet, por nese ne te ardhmen perdoren cookies per autentikim, duhet shtuar CSRF token dhe `SameSite=Strict/Lax`.

**Brute-force login attempts**: `authLimiter` kufizon tentativat per `/auth/register` dhe `/auth/login`. Duhet te simulohet numer i madh tentativash te gabuara dhe te verifikohet statusi `429`.

**Autentikim dhe autorizim**: endpoints te mbrojtura perdorin JWT, ndersa rolet kontrollohen me `requireRole`, `requireAdmin` dhe middleware te ngjashme. Duhet te verifikohet qe klienti nuk hyn ne admin/manager endpoints dhe qe token i pavlefshem kthen `401`.

Rekomandime sigurie para prodhimit:

- `JWT_SECRET` te jete i gjate, unik dhe vetem ne environment variables.
- Te mos perdoret fallback-i lokal i sekretit ne prodhim.
- Te aktivizohet `FORCE_HTTPS=true`.
- Te kufizohet CORS vetem te domain-i real i frontend-it.
- Te mos ruhen secrets ne repository.
- Te kontrollohen file uploads per tip, madhesi dhe emer.

### 1.7 Raport i Shkurter i Testimit

Raporti parafinal duhet te perfshije:

- Data e testimit dhe versioni i commit-it.
- Ambienti ku u testua: local, staging ose production-like.
- Komandat e ekzekutuara dhe log-et kryesore.
- Numri i testeve te kaluara/deshtuara.
- Lista e gabimeve te gjetura dhe prioriteti i tyre.
- Rekomandimet per permiresim.

Statusi i pranimit per kete faze:

- Sistemi pranohet nese kalojne `lint`, `unit/integration tests`, `Cypress E2E`, `Newman API tests`, `performance tests` dhe checklist-a manuale e roleve kryesore.
- Sistemi nuk pranohet nese ka gabime kritike ne login, blerje, autorizim admin/manager, humbje te dhenash ose ekspozim secrets.

## 2. Deploy-i dhe Ambienti i Prodhimit

Qellimi i deploy-it eshte qe platforma te jete e aksesueshme publikisht dhe te mund te perditesohet ne menyre te kontrolluar.

### 2.1 Mjedisi i Hostimit

Projekti ka dy rruge deploy-i:

1. **Render** per publikim te thjeshte dhe te shpejte.
2. **Kubernetes/Helm** per ambient me te avancuar me autoscaling, rolling updates dhe load balancing.

Per dorezim akademik rekomandohet Render si ambient publik, sepse konfigurimi ekziston ne `render.yaml`. Per prodhim me te plote rekomandohet Kubernetes me chart-in `helm/car-dealership`.

Ne Render, aplikacioni konfigurohet si Node service:

- `buildCommand`: instalon varësitë dhe build-on frontend-in.
- `startCommand`: nis backend-in me `npm start`.
- Backend-i mund te sherbeje edhe build-in statik te frontend-it.
- `FORCE_HTTPS=true` aktivizon ridrejtimin ne HTTPS.

### 2.2 CI/CD

Pipeline ekziston ne `.github/workflows/ci-cd.yml` dhe perfshin:

- `ci`: instalim varësish, lint dhe unit/API tests.
- `docker_build`: build dhe push te Docker images ne GHCR.
- `deploy_test`: deploy ne test environment me Helm.
- `integration_tests`: Newman tests kunder ambientit test.
- `deploy_staging`: deploy ne staging pas integrimeve.
- `deploy_production`: deploy ne production kur krijohet tag `v*`.

Procesi i rekomanduar i versionimit:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Ky tag aktivizon deploy-in e prodhimit nese jane vendosur secrets per Kubernetes. Ne Render, auto-deploy mund te lidhet me branch-in `main`.

### 2.3 HTTPS, Domain dhe SSL

Per Render:

- HTTPS ofrohet automatikisht per domain-in e Render.
- Per domain personal, domain-i shtohet ne `Custom Domain` dhe DNS konfigurohet sipas udhezimeve te Render.
- Certifikata SSL menaxhohet nga platforma.
- `FORCE_HTTPS=true` duhet te jete aktiv ne production.

Per Kubernetes:

- Duhet Ingress Controller, zakonisht NGINX Ingress.
- Per SSL mund te perdoret `cert-manager` me Let's Encrypt.
- `ingress.host` ne `values-prod.yaml` duhet te ndryshohet nga `car-dealership.example.com` ne domain-in real.

### 2.4 Environment Variables dhe Siguria

Variables kryesore:

- `NODE_ENV=production`
- `PORT`
- `FORCE_HTTPS=true`
- `MONGO_URI`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DB`
- `JWT_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `REACT_APP_API_URL`

Rregulla sigurie:

- Secrets vendosen vetem ne dashboard-in e platformes, GitHub Secrets ose Kubernetes Secrets.
- Nuk duhet te publikohen vlera reale te `.env`.
- `JWT_SECRET` duhet te rrotullohet nese dyshohet ekspozim.
- Access tokens duhet te kene TTL te shkurter, ndersa refresh tokens duhet te ruhen te hash-uara.

### 2.5 Mirembajtja e Ambientit

Pas deploy-it duhen kontrolluar:

```bash
curl https://<domain>/health
curl https://<domain>/ready
curl https://<domain>/openapi.json
```

Ne Kubernetes:

```bash
kubectl get pods -n car-dealership
kubectl get svc -n car-dealership
kubectl get hpa -n car-dealership
kubectl rollout status deployment/backend -n car-dealership
kubectl rollout status deployment/frontend -n car-dealership
```

Rollback:

- Ne Render: rikthehet deploy-i i meparshem nga dashboard-i.
- Ne Kubernetes: perdoret `helm rollback` ose `kubectl rollout undo`.

Backup:

- MySQL duhet te kete backup periodik te tabelave kryesore si `users`, `cars`, `purchases`, `test_drive_requests` dhe `audit_logs`.
- MongoDB duhet te kete backup te koleksioneve qe perdoren nga sistemi.
- Backup-et ruhen te enkriptuara dhe testohen me restore ne staging.

## 3. Dokumentimi Teknik dhe i Perdorimit

### 3.1 Manual i Perdoruesit Fundor

Perdoruesi fundor mund te:

1. Hape faqen kryesore dhe te shikoje veturat e disponueshme.
2. Perdor filtrat per te kerkuar vetura sipas çmimit, vitit, karburantit, transmisionit ose disponueshmerise.
3. Hape detajet e vetures per te pare galerine, specifikat dhe statusin.
4. Regjistrohet ose kyçet ne sistem.
5. Shtoje vetura ne wishlist.
6. Dergoni kerkese per blerje duke plotesuar te dhenat e bleresit dhe menyren e pageses.
7. Dergoni kerkese per test-drive me date dhe ore te preferuar.
8. Kontaktoje autosallonin permes formes se kontaktit.
9. Ndryshoje password-in ose te perdore reset password nese e harron.

Administratori mund te:

- Shtoje, editoje ose fshije vetura.
- Shenojë vetura si te shitura.
- Shikoje kontaktet, blerjet, test-drives, audit logs dhe statistikat.
- Ngarkoje foto per vetura.

Manager-i mund te:

- Shikoje overview operacional.
- Gjeneroje ose shkarkoje fatura.
- Shqyrtoje trade-in dhe te aprovoje/refuzoje vendime.

### 3.2 Struktura e Kodit

Struktura kryesore:

- `frontend/`: React SPA, komponentet, pages, Redux store dhe konfigurimi i API.
- `backend/`: Express API, routes, controllers, services, repositories, middleware dhe konfigurime.
- `tests/`: Jest, Supertest, Newman dhe performance tests.
- `cypress/`: testime end-to-end.
- `k8s/`: Kubernetes manifests.
- `helm/car-dealership/`: Helm chart per deploy ne test, staging dhe production.
- `.github/workflows/`: CI/CD pipeline.

Backend-i ndjek ndarje me shtresa:

- **Routes** marrin request-in HTTP.
- **Controllers** validojne dhe orientojne logjiken.
- **Services** permbajne rregullat e biznesit.
- **Repositories** komunikojne me databazen.
- **Middleware** trajton auth, role, rate limit, sanitizer, HTTPS dhe upload.

### 3.3 Arkitektura Teknike

Frontend-i eshte React me `axios` per komunikim me API dhe interceptors per JWT refresh. Backend-i eshte Express, me Swagger ne `/api-docs`, OpenAPI JSON ne `/openapi.json`, rate limiting ne `/api`, sanitizer per XSS dhe Helmet per headers sigurie.

MySQL ruan te dhenat kryesore si perdoruesit, veturat, blerjet, test-drives dhe audit logs. MongoDB perdoret si pjese e ambientit te sistemit dhe readiness check. Sistemi ekspozon endpoint-e monitorimi si `/health`, `/ready`, `/metrics` dhe `/status`.

Autentikimi bazohet ne JWT:

- `accessToken` me kohe te shkurter.
- `refreshToken` per rinovim sesioni.
- refresh tokens ruhen te hash-uara dhe mund te revokohen.
- rolet perdoren per ndarje `client`, `manager` dhe `admin`.

### 3.4 API Reference

Dokumentimi i plote i API gjendet ne:

- Local Swagger UI: `http://localhost:5000/api-docs`
- OpenAPI JSON: `http://localhost:5000/openapi.json`
- Versioned OpenAPI: `http://localhost:5000/api/v1/openapi.json`

Endpoint-e kryesore:

- `POST /api/auth/register`: regjistron perdorues.
- `POST /api/auth/login`: kthen access dhe refresh token.
- `POST /api/auth/refresh`: rinovon sesionin.
- `GET /api/v1/cars`: liston veturat me filtra dhe pagination.
- `GET /api/v1/cars/{id}`: kthen detajet e vetures.
- `POST /api/v1/cars/{id}/purchase`: krijon blerje.
- `GET /api/v1/users/me`: kthen profilin e perdoruesit.
- `GET /api/v1/admin/stats`: statistika per admin.
- `GET /api/v1/manager/overview`: overview per manager/admin.

Shembull login request:

```json
{
  "email": "admin@gmail.com",
  "password": "12345678"
}
```

Shembull login response:

```json
{
  "success": true,
  "tokenType": "Bearer",
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "user": {
    "id": 1,
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

### 3.5 Instalimi Lokal

Hapat lokal:

```bash
npm install
cd frontend && npm install && cd ..
npm run dev
```

Ne terminal tjeter:

```bash
cd frontend
npm start
```

Backend-i hapet ne `http://localhost:5000`, ndersa frontend-i ne `http://localhost:3000`. Para nisjes duhet krijuar `backend/.env` me vlerat e MySQL, MongoDB dhe JWT.

### 3.6 Mirembajtja dhe Versionimi

Perditesimet duhet te ndjekin kete rrjedhe:

1. Krijohet branch i ri per ndryshimin.
2. Ekzekutohen testet lokale.
3. Hapet pull request drejt `main`.
4. CI duhet te kaloje pa gabime.
5. Behet merge ne `main`.
6. Per prodhim krijohet tag versioni, per shembull `v1.0.0`.
7. Monitorohen `/health`, `/ready`, logs dhe metrics pas deploy-it.

Versionimi rekomandohet sipas SemVer:

- `MAJOR`: ndryshime qe prishin kompatibilitetin.
- `MINOR`: funksionalitete te reja pa prishur API.
- `PATCH`: bug fixes dhe permiresime te vogla.

Rikuperimi pas incidentit:

- Identifikohet versioni problematik nga logs ose metrics.
- Behet rollback ne versionin e fundit stabil.
- Restaurohet databaza nga backup nese ka humbje te dhenash.
- Dokumentohet incidenti dhe shtohen teste qe e parandalojne perseritjen.

## Perfundim

Faza 4 siguron qe projekti **Car Dealership** nuk eshte vetem funksional, por edhe i testuar, i deploy-ueshem, i monitorueshem dhe i dokumentuar. Me testet e automatizuara, checklist-en manuale, Swagger/OpenAPI, CI/CD, HTTPS, environment variables te sigurta dhe procedure mirembajtjeje, sistemi eshte i pergatitur per prezantim parafinal dhe per kalim drejt nje ambienti real prodhimi.
