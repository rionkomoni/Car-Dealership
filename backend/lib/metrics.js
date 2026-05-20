const client = require("prom-client");

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "car_dealership_",
});

const httpRequestsTotal = new client.Counter({
  name: "car_dealership_http_requests_total",
  help: "Total HTTP requests processed",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: "car_dealership_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

function normalizeRoute(req) {
  if (req.route?.path) return req.baseUrl + req.route.path;
  const p = req.path || "unknown";
  return p.length > 100 ? `${p.slice(0, 97)}...` : p;
}

function metricsMiddleware(req, res, next) {
  if (req.path === "/metrics" || req.path === "/status") {
    return next();
  }
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const labels = {
      method: req.method,
      route: normalizeRoute(req),
      status: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    const elapsedSec = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestDuration.observe(labels, elapsedSec);
  });
  next();
}

async function metricsHandler(_req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler,
};
