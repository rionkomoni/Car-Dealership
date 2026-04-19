const Joi = require("joi");
const carService = require("../services/carService");
const { logModuleEvent } = require("../lib/moduleLogger");

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
  gallery: Joi.array().items(Joi.string().max(2048)).max(12).optional().allow(null),
});

async function list(req, res) {
  try {
    const data = await carService.listCars();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const data = await carService.getCarDetails(Number(req.params.id));
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function create(req, res) {
  const { error, value } = carBodySchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const data = await carService.createCar(value, req.user.id);
    logModuleEvent("businessOperations", "car_create", {
      carId: data.id,
      userId: req.user.id,
    });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function update(req, res) {
  const { error, value } = carBodySchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const data = await carService.updateCar(Number(req.params.id), value, req.user.id);
    logModuleEvent("businessOperations", "car_update", {
      carId: Number(req.params.id),
      userId: req.user.id,
    });
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function remove(req, res) {
  try {
    const data = await carService.deleteCar(Number(req.params.id), req.user.id);
    logModuleEvent("businessOperations", "car_delete", {
      carId: Number(req.params.id),
      userId: req.user.id,
    });
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
