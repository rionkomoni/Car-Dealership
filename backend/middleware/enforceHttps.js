/**
 * Kur FORCE_HTTPS=true, kërkon HTTPS në prod/gateway (X-Forwarded-Proto).
 * Përjashton /health dhe /ready që përdoren nga probe pa TLS direkt.
 */
function enforceHttps(req, res, next) {
  if (process.env.FORCE_HTTPS !== "true") {
    return next();
  }
  if (req.path === "/health" || req.path === "/ready") {
    return next();
  }
  const proto = req.get("x-forwarded-proto") || req.protocol;
  if (proto === "https") {
    return next();
  }
  const host = req.get("host") || "localhost";
  return res.redirect(301, `https://${host}${req.originalUrl}`);
}

module.exports = enforceHttps;
