const express = require("express");
const authRoutes = require("../authRoutes");
const carRoutes = require("../carRoutes");
const contactRoutes = require("../contactRoutes");
const carLogRoutes = require("../carLogRoutes");
const adminRoutes = require("../adminRoutes");
const userRoutes = require("../userRoutes");
const managerRoutes = require("../managerRoutes");
const integrationRoutes = require("./integrationRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    version: "v1",
    _links: {
      self: { href: "/api/v1/health" },
      docs: { href: "/api-docs" },
    },
  });
});

router.use("/auth", authRoutes);
router.use("/cars", carRoutes);
router.use("/contact", contactRoutes);
router.use("/car-logs", carLogRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/manager", managerRoutes);
router.use("/integrations", integrationRoutes);

module.exports = router;
