# Udhëzim deploy — Car Dealership

Stack: **Vercel** (frontend) + **Render** (backend) + **Railway** (MySQL) + **MongoDB Atlas**.

Domain:
- Frontend: `https://car-dealership-kohl.vercel.app` (ose `cardealership.fit`)
- API: `https://api.cardealership.fit`

---

## 1. Railway (MySQL — makinat)

1. [railway.app](https://railway.app) → projekti → **MySQL**
2. **Settings → Networking → Public Networking = ON**
3. **Connect** → kopjo: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`
4. Ruaji — i përdor në `.env` lokal **dhe** Render (duhet të jenë **identike**)

---

## 2. MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → cluster
2. **Network Access** → Add IP → `0.0.0.0/0`
3. **Database Access** → user + password
4. **Connect → Drivers** → kopjo connection string → `MONGO_URI`
5. Përdor **të njëjtin** `MONGO_URI` në `.env` dhe Render

---

## 3. Render (backend — API)

1. [dashboard.render.com](https://dashboard.render.com) → shërbimi `car-dealership`
2. **Environment** — vendos (kopjo nga `backend/.env` + ndryshimet e Render):

| Variabli | Vlera |
|----------|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `FORCE_HTTPS` | `true` |
| `MYSQL_HOST` | nga Railway |
| `MYSQL_PORT` | nga Railway (p.sh. `18396`) |
| `MYSQL_USER` | nga Railway |
| `MYSQL_PASSWORD` | nga Railway |
| `MYSQL_DB` | nga Railway |
| `MYSQL_AUTO_CREATE_DB` | `false` |
| `MONGO_URI` | nga Atlas (i njëjti si `.env`) |
| `JWT_SECRET` | i njëjti si në `.env` |
| `REACT_APP_API_URL` | `https://api.cardealership.fit` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | si `.env` |
| `MANAGER_EMAIL` / `MANAGER_PASSWORD` | si `.env` |
| SMTP vars | si `.env` (opsional) |

3. **Custom Domains** → `api.cardealership.fit` (nëse nuk e ke)
4. **Manual Deploy** → Deploy latest commit
5. **Logs** — duhet:
   ```
   MySQL connected
   MongoDB connected
   Server running on port 10000
   ```
6. Testo:
   - `https://api.cardealership.fit/ready`
   - `https://api.cardealership.fit/api/cars?page=1&pageSize=8`

---

## 4. Vercel (frontend)

1. [vercel.com](https://vercel.com) → projekti
2. **Settings → General → Root Directory** = `frontend`
3. **Environment Variables**:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://api.cardealership.fit` |

4. **Deployments → Redeploy** (obligator pas çdo ndryshimi)
5. Hap faqen → **Ctrl+Shift+R**

---

## 5. Lokal (PC)

1. Kopjo `backend/.env.example` → `backend/.env`
2. Vendos vlerat nga Railway + Atlas
3. `PORT=5000` (jo 10000)
4. Nis:
   ```bash
   npm start
   cd frontend && npm start
   ```

---

## 6. Push kod në GitHub (Render merr nga Git)

```bash
git add .
git commit -m "Fix deploy: MySQL retry, env template, vercel config"
git push origin main
```

Pastaj Render → Manual Deploy.

---

## Probleme

| Simptom | Zgjidhje |
|---------|----------|
| 0 vetura në Vercel | `REACT_APP_API_URL` + Redeploy |
| `PROTOCOL_CONNECTION_LOST` | Railway public ON; `MYSQL_PORT` i saktë në Render |
| Token i skaduar | Dil + hyr përsëri |
| API timeout | Render free tier — prit 60s herën e parë |
| `/ready` mongo down | Atlas IP `0.0.0.0/0`; `MONGO_URI` i saktë |

---

## Checklist

- [ ] Railway MySQL publik, vars kopjuar
- [ ] Atlas IP whitelist + MONGO_URI
- [ ] Render env = `.env` (MySQL/Mongo/JWT) + PORT 10000
- [ ] Render logs: Server running
- [ ] `/api/cars` kthen JSON
- [ ] Vercel REACT_APP_API_URL + Redeploy
- [ ] Git push + Render deploy
