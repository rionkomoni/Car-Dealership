const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "cars");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)
      ? ext
      : ".jpg";
    const name = `car-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
  if (!ok) {
    return cb(new Error("Lejohen vetëm imazhe (JPEG, PNG, WebP, GIF)."));
  }
  cb(null, true);
}

const uploadCarImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
});

module.exports = { uploadCarImage, uploadDir };
