/**
 * Service Discovery — regjistrim opsional në HashiCorp Consul.
 * Aktivizohet me CONSUL_ENABLED=true (p.sh. docker-compose.gateway.yml).
 */

let lastRegistration = { enabled: false, registered: false };

function isConsulEnabled() {
  return String(process.env.CONSUL_ENABLED || "").toLowerCase() === "true";
}

function getConsulBaseUrl() {
  return (process.env.CONSUL_HTTP_ADDR || "http://localhost:8500").replace(/\/$/, "");
}

function getConsulStatus() {
  return { ...lastRegistration };
}

async function registerWithConsul() {
  if (!isConsulEnabled()) {
    lastRegistration = { enabled: false, registered: false, reason: "CONSUL_ENABLED is not true" };
    return lastRegistration;
  }

  const consulAddr = getConsulBaseUrl();
  const serviceId = process.env.SERVICE_ID || "car-dealership-api";
  const serviceName = process.env.SERVICE_NAME || "car-dealership-api";
  const address = process.env.SERVICE_ADDRESS || "127.0.0.1";
  const port = Number(process.env.SERVICE_PORT || process.env.PORT || 5000);
  const healthPath = process.env.SERVICE_HEALTH_PATH || "/health";
  const healthScheme = process.env.SERVICE_HEALTH_SCHEME || "http";
  const healthUrl =
    process.env.SERVICE_HEALTH_URL ||
    `${healthScheme}://${address}:${port}${healthPath}`;

  const payload = {
    ID: serviceId,
    Name: serviceName,
    Address: address,
    Port: port,
    Tags: ["api", "nodejs", "car-dealership", "layered-monolith"],
    Meta: {
      version: process.env.npm_package_version || "1.0.0",
      architecture: "layered-monolith",
    },
    Check: {
      HTTP: healthUrl,
      Interval: "15s",
      Timeout: "5s",
      DeregisterCriticalServiceAfter: "2m",
    },
  };

  const res = await fetch(`${consulAddr}/v1/agent/service/register`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Consul register failed (${res.status}): ${text || res.statusText}`);
  }

  lastRegistration = {
    enabled: true,
    registered: true,
    serviceId,
    serviceName,
    consulAddr,
    healthUrl,
    registeredAt: new Date().toISOString(),
  };
  return lastRegistration;
}

async function deregisterFromConsul() {
  if (!isConsulEnabled() || !lastRegistration.registered) {
    return { deregistered: false };
  }

  const consulAddr = getConsulBaseUrl();
  const serviceId = process.env.SERVICE_ID || "car-dealership-api";

  try {
    const res = await fetch(
      `${consulAddr}/v1/agent/service/deregister/${encodeURIComponent(serviceId)}`,
      { method: "PUT" }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Consul deregister warning (${res.status}): ${text}`);
    }
  } catch (err) {
    console.warn("Consul deregister failed:", err.message);
  }

  lastRegistration = { ...lastRegistration, registered: false, deregisteredAt: new Date().toISOString() };
  return { deregistered: true, serviceId };
}

/**
 * List healthy service instances from Consul catalog (when enabled).
 */
async function discoverServicesFromConsul() {
  if (!isConsulEnabled()) {
    return { enabled: false, services: [] };
  }
  const consulAddr = getConsulBaseUrl();
  const res = await fetch(
    `${consulAddr}/v1/health/service/${encodeURIComponent(
      process.env.SERVICE_NAME || "car-dealership-api"
    )}?passing=true`
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Consul discovery failed (${res.status}): ${text || res.statusText}`);
  }
  const rows = await res.json();
  const services = rows.map((entry) => ({
    id: entry.Service?.ID,
    name: entry.Service?.Service,
    address: entry.Service?.Address,
    port: entry.Service?.Port,
    tags: entry.Service?.Tags || [],
    meta: entry.Service?.Meta || {},
  }));
  return { enabled: true, services };
}

module.exports = {
  isConsulEnabled,
  getConsulStatus,
  registerWithConsul,
  deregisterFromConsul,
  discoverServicesFromConsul,
};
