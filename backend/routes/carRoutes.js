const express = require("express");
const auth = require("../middleware/auth");
const carController = require("../controllers/carController");

const router = express.Router();
router.get("/", carController.list);
router.get("/:id", carController.getById);
router.post("/", auth, carController.create);
router.put("/:id", auth, carController.update);
router.delete("/:id", auth, carController.remove);

module.exports = router;
