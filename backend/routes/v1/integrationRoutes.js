const express = require("express");
const { publishEvent, getMessageBusStatus } = require("../../integrations/messageBus");
const {
  getV1HealthWithBreaker,
  getBreakerState,
} = require("../../integrations/internalApiClient");

const router = express.Router();

router.get("/messaging/status", (req, res) => {
  return res.json({
    status: "ok",
    bus: getMessageBusStatus(),
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
