const express = require("express");
const multer = require("multer");
const requireAdmin = require("../middleware/requireAdmin");
const { uploadCarImage } = require("../middleware/uploadCarImage");

const router = express.Router();

function publicUrl(req, filename) {
  const base =
    process.env.PUBLIC_API_URL ||
    `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/$/, "")}/uploads/cars/${filename}`;
}

router.post(
  "/car-image",
  requireAdmin,
  uploadCarImage.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nuk u dërgua asnjë skedar." });
    }
    return res.status(201).json({
      message: "Imazhi u ngarkua.",
      filename: req.file.filename,
      url: publicUrl(req, req.file.filename),
      path: `/uploads/cars/${req.file.filename}`,
    });
  }
);

router.post(
  "/car-images",
  requireAdmin,
  uploadCarImage.array("images", 12),
  (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ message: "Nuk u dërguan skedarë." });
    }
    const items = files.map((f) => ({
      filename: f.filename,
      url: publicUrl(req, f.filename),
      path: `/uploads/cars/${f.filename}`,
    }));
    return res.status(201).json({
      message: `${items.length} imazhe u ngarkuan.`,
      files: items,
    });
  }
);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Skedari është shumë i madh (max 5MB)." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  return next();
});

module.exports = router;
