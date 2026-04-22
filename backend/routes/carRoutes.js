const express = require("express");
const Joi = require("joi");
const pool = require("../config/mysql");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const { saveCarLog } = require("../services/carLogService");
const { cache, clearApiCache } = require("../middleware/cache");
const InventoryCar = require("../domain/entities/InventoryCar");
const TradeInVehicle = require("../domain/entities/TradeInVehicle");
const PurchaseQuote = require("../domain/entities/PurchaseQuote");

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
  gallery: Joi.array()
    .items(Joi.string().max(2048))
    .max(12)
    .optional()
    .allow(null),
});

const soldOutSchema = Joi.object({
  sold_out: Joi.boolean().required(),
});

const purchaseSchema = Joi.object({
  buyer_name: Joi.string().min(2).max(120).required(),
  buyer_email: Joi.string().email({ tlds: { allow: false } }).required(),
  buyer_phone: Joi.string().max(40).allow("", null).optional(),
  payment_method: Joi.string()
    .valid("cash", "bank_transfer", "financing", "leasing")
    .required(),
  notes: Joi.string().max(2500).allow("", null).optional(),
  trade_in: Joi.object({
    current_car: Joi.string().min(2).max(150).required(),
    year: Joi.number().integer().min(1950).max(2100).required(),
    mileage_km: Joi.number().integer().min(0).required(),
    estimated_value: Joi.number().min(0).required(),
  })
    .optional()
    .allow(null),
});

function parseGalleryFromDb(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const p = JSON.parse(value);
      return Array.isArray(p) ? p.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function shapeCar(row) {
  if (!row) return row;
  return {
    ...row,
    gallery: parseGalleryFromDb(row.gallery),
  };
}

function withLinks(req, car) {
  return {
    ...car,
    _links: {
      self: { href: `${req.baseUrl}/${car.id}` },
      collection: { href: req.baseUrl },
    },
  };
}

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

function normalizeGalleryForDb(body) {
  if (!body.gallery || !Array.isArray(body.gallery)) return null;
  const cleaned = body.gallery
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 12);
  return cleaned.length ? JSON.stringify(cleaned) : null;
}

router.get("/", cache("2 minutes"), async (req, res) => {
  try {
    const [cars] = await pool.query("SELECT * FROM cars ORDER BY id DESC");
    const items = cars.map((car) => withLinks(req, shapeCar(car)));
    return res.json({
      data: items,
      _links: {
        self: { href: req.baseUrl },
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:id", cache("2 minutes"), async (req, res) => {
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

    return res.json(withLinks(req, shapeCar(car)));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { error, value } = carBodySchema.validate(req.body, {
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const spec = normalizeSpecs(value);
  const galleryJson = normalizeGalleryForDb(value);
  const { name, price, year, image } = value;

  try {
    const [result] = await pool.query(
      `INSERT INTO cars (
        name, price, year, image, created_by,
        mileage_km, fuel, transmission, engine, power_hp, color, body_type, description,
        gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        galleryJson,
      ]
    );

    await saveCarLog({
      action: "create",
      carId: result.insertId,
      userId: req.user.id,
      carName: name,
    });
    clearApiCache();

    return res.status(201).json({
      message: "Vetura u shtua me sukses",
      id: result.insertId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
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
    let galleryJson = normalizeGalleryForDb(value);
    if (value.gallery === undefined) {
      const [[existing]] = await pool.query(
        "SELECT gallery FROM cars WHERE id = ?",
        [carId]
      );
      galleryJson = existing?.gallery ?? null;
    }

    await pool.query(
      `UPDATE cars SET
        name = ?, price = ?, year = ?, image = ?,
        mileage_km = ?, fuel = ?, transmission = ?, engine = ?, power_hp = ?,
        color = ?, body_type = ?, description = ?, gallery = ?
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
        galleryJson,
        carId,
      ]
    );

    await saveCarLog({
      action: "update",
      carId,
      userId: req.user.id,
      carName: name,
    });
    clearApiCache();

    return res.json({ message: "Vetura u përditësua me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/sold-out", requireAdmin, async (req, res) => {
  const { error, value } = soldOutSchema.validate(req.body, {
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const carId = Number(req.params.id);
  const soldOutValue = value.sold_out ? 1 : 0;

  try {
    const [rows] = await pool.query("SELECT name FROM cars WHERE id = ?", [
      carId,
    ]);
    const carName = rows[0]?.name;
    if (!carName) {
      return res.status(404).json({ message: "Vetura nuk u gjet" });
    }

    await pool.query("UPDATE cars SET sold_out = ? WHERE id = ?", [
      soldOutValue,
      carId,
    ]);

    await saveCarLog({
      action: soldOutValue ? "mark_sold_out" : "mark_available",
      carId,
      userId: req.user.id,
      carName,
    });
    clearApiCache();

    return res.json({
      message: soldOutValue
        ? "Vetura u shënua sold out"
        : "Vetura u shënua available",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/:id/purchase", auth, async (req, res) => {
  const { error, value } = purchaseSchema.validate(req.body, {
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const carId = Number(req.params.id);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT id, name, year, mileage_km, price, sold_out FROM cars WHERE id = ? FOR UPDATE",
      [carId]
    );
    const car = rows[0];
    if (!car) {
      await conn.rollback();
      return res.status(404).json({ message: "Vetura nuk u gjet" });
    }

    let inventoryCar;
    let tradeInVehicle = null;
    let quote;
    try {
      inventoryCar = new InventoryCar(car);
      if (value.trade_in) {
        tradeInVehicle = new TradeInVehicle(value.trade_in);
      }
      quote = new PurchaseQuote({ inventoryCar, tradeInVehicle });
      quote.validateBusinessRules();
    } catch (modelErr) {
      await conn.rollback();
      const isSoldOut = /sold out/i.test(modelErr.message);
      return res.status(isSoldOut ? 409 : 400).json({ message: modelErr.message });
    }

    const price = inventoryCar.price;
    const tradeValue = quote.getTradeInValue();
    const amountToAdd = quote.calculateAmountToAdd();

    await conn.query(
      `INSERT INTO purchases (
        car_id, buyer_user_id, buyer_name, buyer_email, buyer_phone, payment_method,
        car_price, trade_in_car, trade_in_year, trade_in_mileage_km, trade_in_value,
        trade_in_status, amount_to_add, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        carId,
        req.user.id,
        value.buyer_name,
        value.buyer_email.toLowerCase(),
        value.buyer_phone || null,
        value.payment_method,
        price,
        tradeInVehicle?.name || null,
        tradeInVehicle?.year || null,
        tradeInVehicle?.mileageKm || null,
        tradeValue,
        tradeInVehicle ? "pending" : "approved",
        amountToAdd,
        value.notes || null,
      ]
    );

    await conn.query("UPDATE cars SET sold_out = 1 WHERE id = ?", [carId]);
    await conn.commit();

    await saveCarLog({
      action: "purchase",
      carId,
      userId: req.user.id,
      carName: car.name,
    });
    clearApiCache();

    return res.status(201).json({
      message: "Blerja u regjistrua me sukses. Vetura u shënua sold out.",
      purchase: {
        car_id: carId,
        car_name: car.name,
        car_price: price,
        trade_in_value: tradeValue,
        amount_to_add: amountToAdd,
        sold_out: true,
      },
    });
  } catch (err) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Kjo veturë është blerë tashmë." });
    }
    return res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
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
    clearApiCache();

    return res.json({ message: "Vetura u fshi me sukses" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
