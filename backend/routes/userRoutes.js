const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, userController.getMe);
router.post("/activation/request", userController.requestActivation);
router.get("/activate", userController.activate);
router.post("/password/reset/request", userController.requestPasswordReset);
router.post("/password/reset/confirm", userController.resetPassword);
router.post("/me/password", auth, userController.changePassword);

router.get("/", requireAdmin, userController.listAll);
router.get("/:id", requireAdmin, userController.getOne);
router.post("/", requireAdmin, userController.create);
router.put("/:id", requireAdmin, userController.update);
router.delete("/:id", requireAdmin, userController.remove);

module.exports = router;
