const express = require("express");
const Joi = require("joi");
const pool = require("../config/mysql");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [cars] = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    return res.json(cars);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [cars] = await pool.query("SELECT * FROM cars WHERE id = ?", [
      req.params.id,
    ]);

    if (cars.length === 0) {
      return res.status(404).json({ message: "Vetura nuk u gjet" });
    }

    return res.json(cars[0]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    year: Joi.number().required(),
    image: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, price, year, image } = req.body;

  try {
    await pool.query(
      "INSERT INTO cars (name, price, year, image, created_by) VALUES (?, ?, ?, ?, ?)",
      [name, price, year, image, req.user.id]
    );

    return res.status(201).json({ message: "Vetura u shtua me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    year: Joi.number().required(),
    image: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, price, year, image } = req.body;

  try {
    await pool.query(
      "UPDATE cars SET name = ?, price = ?, year = ?, image = ? WHERE id = ?",
      [name, price, year, image, req.params.id]
    );

    return res.json({ message: "Vetura u përditësua me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM cars WHERE id = ?", [req.params.id]);
    return res.json({ message: "Vetura u fshi me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;