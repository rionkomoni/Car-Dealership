/**
 * Load test i thjeshtë — nuk kërkon ndryshime në backend.
 * Synon /health (jashtë /api, pra nuk godet rate limiter-in e API-së).
 *
 * Ekzekutim (PowerShell):
 *   $env:BASE_URL="http://localhost:5000"; k6 run scripts/k6-health.js
 *
 * Ose me Docker / host tjetër:
 *   $env:BASE_URL="http://127.0.0.1:5000"; k6 run scripts/k6-health.js
 */
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export default function () {
  const res = http.get(`${BASE.replace(/\/$/, "")}/health`);
  check(res, {
    "status 200": (r) => r.status === 200,
    "body has status ok": (r) => {
      try {
        const b = r.json();
        return b && b.status === "ok";
      } catch {
        return false;
      }
    },
  });
  sleep(0.3);
}
