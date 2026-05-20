const express = require("express");
const { publishEvent, getMessageBusStatus } = require("../../integrations/messageBus");
const {
  getV1HealthWithBreaker,
  getBreakerState,
} = require("../../integrations/internalApiClient");
const { getCacheStatus } = require("../../middleware/cache");
const { getServiceRegistry, listServiceEntries } = require("../../integrations/serviceRegistry");
const { getModuleManifest } = require("../../modules/moduleManifest");
const { getLayerArchitecture } = require("../../architecture/layerMap");
const {
  getConsulStatus,
  discoverServicesFromConsul,
} = require("../../integrations/consulRegistry");

const router = express.Router();

router.get("/discovery", (req, res) => {
  return res.json({
    status: "ok",
    model: "layered-modular-monolith",
    horizontalScaling: {
      stateless: true,
      kubernetes: "k8s/backend-hpa.yaml",
      gateway: "deploy/nginx/api-gateway.conf",
    },
    serviceRegistry: getServiceRegistry(),
    modules: listServiceEntries(),
    moduleManifest: getModuleManifest(),
    layers: getLayerArchitecture(),
    consul: getConsulStatus(),
    _links: {
      health: { href: "/health" },
      ready: { href: "/ready" },
      openapi: { href: "/api-docs" },
    },
  });
});

router.get("/consul/services", async (req, res) => {
  try {
    const discovery = await discoverServicesFromConsul();
    return res.json({ status: "ok", ...discovery });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      message: err.message,
      consul: getConsulStatus(),
    });
  }
});

router.get("/messaging/status", (req, res) => {
  return res.json({
    status: "ok",
    bus: getMessageBusStatus(),
    cache: getCacheStatus(),
  });
});

router.post("/messaging/test-event", async (req, res) => {
  const eventName = String(req.body?.event || "system.test").trim();
  const payload = req.body?.payload || { source: "manual-test" };
  const r = await publishEvent(eventName, payload);
  return res.json({
    status: "published",
    event: eventName,
    mode: r.mode,
  });
});

router.get("/sync/health-through-breaker", async (req, res) => {
  try {
    const data = await getV1HealthWithBreaker();
    return res.json({
      status: "ok",
      breaker: getBreakerState(),
      upstream: data,
    });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      message: err.message,
      breaker: getBreakerState(),
    });
  }
});

module.exports = router;
