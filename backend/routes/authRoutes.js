const express = require("express");
const Joi = require("joi");
const authService = require("../services/authService");
const { auditContextFromReq } = require("../services/auditService");
const { authLimiter } = require("../middleware/rateLimiter");
const authController = require("../controllers/authController");

const router = express.Router();

const refreshSchema = Joi.object({
  refreshToken: Joi.string().min(20).required(),
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

router.post("/refresh", async (req, res) => {
  const { error, value } = refreshSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const result = await authService.refreshSession(
      value.refreshToken,
      auditContextFromReq(req)
    );
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

router.post("/logout", async (req, res) => {
  const { error, value } = refreshSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const result = await authService.logoutUser(value.refreshToken, auditContextFromReq(req));
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;
