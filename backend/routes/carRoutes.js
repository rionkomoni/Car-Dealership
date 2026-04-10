const express = require("express");
const Joi = require("joi");
const pool = require("../config/mysql");
const auth = require("../middleware/auth");
const { saveCarLog } = require("../services/carLogService");

const router = express.Router();

const carBodySchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  year: Joi.number().integer().required(),
  image: Joi.string().required(),
  mileage_km: Joi.number().integer().min(0).optional().allow(null),
  fuel: Joi.string().max(40).allow("", null).optional(),
  transmission: Joi.string().max(40).allow("", null).optional(),
  engine: Joi.string().max(100).allow("", null).optional(),
  power_hp: Joi.number().integer().min(0).max(2500).optional().allow(null),
  color: Joi.string().max(50).allow("", null).optional(),
  body_type: Joi.string().max(40).allow("", null).optional(),
  description: Joi.string().max(4000).allow("", null).optional(),
});

function normalizeSpecs(body) {
  const empty = (v) => (v === "" || v === undefined ? null : v);
  return {
    mileage_km: body.mileage_km ?? null,
    fuel: empty(body.fuel),
    transmission: empty(body.transmission),
    engine: empty(body.engine),
    power_hp: body.power_hp ?? null,
    color: empty(body.color),
    body_type: empty(body.body_type),
    description: empty(body.description),
  };
}

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

    const car = cars[0];
    await saveCarLog({
      action: "view",
      carId: car.id,
      carName: car.name,
    });

    return res.json(car);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  const { error, value } = carBodySchema.validate(req.body, {
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const spec = normalizeSpecs(value);
  const { name, price, year, image } = value;

  try {
    const [result] = await pool.query(
      `INSERT INTO cars (
        name, price, year, image, created_by,
        mileage_km, fuel, transmission, engine, power_hp, color, body_type, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        price,
        year,
        image,
        req.user.id,
        spec.mileage_km,
        spec.fuel,
        spec.transmission,
        spec.engine,
        spec.power_hp,
        spec.color,
        spec.body_type,
        spec.description,
      ]
    );

    await saveCarLog({
      action: "create",
      carId: result.insertId,
      userId: req.user.id,
      carName: name,
    });

    return res.status(201).json({
      message: "Vetura u shtua me sukses",
      id: result.insertId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error, value } = carBodySchema.validate(req.body, {
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const spec = normalizeSpecs(value);
  const { name, price, year, image } = value;
  const carId = Number(req.params.id);

  try {
    await pool.query(
      `UPDATE cars SET
        name = ?, price = ?, year = ?, image = ?,
        mileage_km = ?, fuel = ?, transmission = ?, engine = ?, power_hp = ?,
        color = ?, body_type = ?, description = ?
      WHERE id = ?`,
      [
        name,
        price,
        year,
        image,
        spec.mileage_km,
        spec.fuel,
        spec.transmission,
        spec.engine,
        spec.power_hp,
        spec.color,
        spec.body_type,
        spec.description,
        carId,
      ]
    );

    await saveCarLog({
      action: "update",
      carId,
      userId: req.user.id,
      carName: name,
    });

    return res.json({ message: "Vetura u përditësua me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const carId = Number(req.params.id);

  try {
    const [rows] = await pool.query("SELECT name FROM cars WHERE id = ?", [
      carId,
    ]);
    const carName = rows[0]?.name;

    await pool.query("DELETE FROM cars WHERE id = ?", [carId]);

    await saveCarLog({
      action: "delete",
      carId,
      userId: req.user.id,
      carName,
    });

    return res.json({ message: "Vetura u fshi me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
