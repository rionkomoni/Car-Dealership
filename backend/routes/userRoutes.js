const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const userController = require("../controllers/userController");
const { passwordResetLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/me", auth, userController.getMe);
router.get("/me/purchases", auth, userController.getMyPurchases);
router.get("/me/test-drives", auth, userController.getMyTestDrives);
router.get("/me/wishlist", auth, userController.getMyWishlist);
router.post("/me/wishlist/sync", auth, userController.syncWishlist);
router.post("/me/wishlist/:carId", auth, userController.addWishlistItem);
router.delete("/me/wishlist/:carId", auth, userController.removeWishlistItem);
router.post("/activation/request", userController.requestActivation);
router.get("/activate", userController.activate);
router.post("/password/reset/request", passwordResetLimiter, userController.requestPasswordReset);
router.post("/password/reset/confirm", userController.resetPassword);
router.post("/me/password", auth, userController.changePassword);

router.get("/", requireAdmin, userController.listAll);
router.get("/:id", requireAdmin, userController.getOne);
router.post("/", requireAdmin, userController.create);
router.put("/:id", requireAdmin, userController.update);
router.delete("/:id", requireAdmin, userController.remove);

module.exports = router;
