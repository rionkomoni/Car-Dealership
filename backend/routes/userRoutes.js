const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, userController.getMe);
router.get("/", requireAdmin, userController.listAll);

module.exports = router;
