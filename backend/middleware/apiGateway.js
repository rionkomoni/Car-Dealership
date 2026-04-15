const crypto = require("crypto");

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 120;
const ipCounters = new Map();

function cleanupCounters(now) {
  for (const [ip, entry] of ipCounters.entries()) {
    if (now - entry.start > WINDOW_MS) {
      ipCounters.delete(ip);
    }
  }
}

function requestIdMiddleware(req, res, next) {
  const existing = req.headers["x-request-id"];
  const requestId = existing || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

function rateLimitMiddleware(req, res, next) {
  const now = Date.now();
  cleanupCounters(now);

  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const record = ipCounters.get(ip);

  if (!record || now - record.start > WINDOW_MS) {
    ipCounters.set(ip, { start: now, count: 1 });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      message: "Too many requests. Try again in a minute.",
    });
  }

  record.count += 1;
  ipCounters.set(ip, record);
  return next();
}

function gatewayLogger(req, res, next) {
  const startedAt = Date.now();
  res.on("finish", () => {
    const latency = Date.now() - startedAt;
    console.log(
      `[gateway] ${req.method} ${req.originalUrl} :: ${res.statusCode} :: ${latency}ms :: reqId=${req.requestId}`
    );
  });
  next();
}

module.exports = {
  requestIdMiddleware,
  rateLimitMiddleware,
  gatewayLogger,
};
