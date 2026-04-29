const { CircuitBreaker } = require("../lib/circuitBreaker");

const breaker = new CircuitBreaker({
  failureThreshold: process.env.CB_FAILURE_THRESHOLD || 3,
  cooldownMs: process.env.CB_COOLDOWN_MS || 15000,
  requestTimeoutMs: process.env.CB_REQUEST_TIMEOUT_MS || 4000,
});

function resolveBaseUrl() {
  if (process.env.INTERNAL_API_BASE_URL) return process.env.INTERNAL_API_BASE_URL;
  const port = Number(process.env.PORT) || 5000;
  return `http://localhost:${port}`;
}

async function getV1HealthWithBreaker() {
  const baseUrl = resolveBaseUrl();
  return breaker.execute(async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    if (!response.ok) {
      throw new Error(`Internal API error: ${response.status}`);
    }
    return response.json();
  });
}

function getBreakerState() {
  return breaker.snapshot();
}

module.exports = {
  getV1HealthWithBreaker,
  getBreakerState,
};
