const carRepository = require("../repositories/carRepository");
const { saveCarLog } = require("./carLogService");

function parseGalleryFromDb(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
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

async function listCars() {
  const cars = await carRepository.listCars();
  return cars.map(shapeCar);
}

async function getCarDetails(id) {
  const car = await carRepository.getCarById(id);
  if (!car) {
    const error = new Error("Vetura nuk u gjet");
    error.status = 404;
    throw error;
  }

  await saveCarLog({
    action: "view",
    carId: car.id,
    carName: car.name,
  });

  return shapeCar(car);
}

async function createCar(body, userId) {
  const spec = normalizeSpecs(body);
  const gallery = normalizeGalleryForDb(body);
  const carId = await carRepository.createCar({
    name: body.name,
    price: body.price,
    year: body.year,
    image: body.image,
    created_by: userId,
    ...spec,
    gallery,
  });

  await saveCarLog({
    action: "create",
    carId,
    userId,
    carName: body.name,
  });

  return { message: "Vetura u shtua me sukses", id: carId };
}

async function updateCar(id, body, userId) {
  const existing = await carRepository.getCarById(id);
  if (!existing) {
    const error = new Error("Vetura nuk u gjet");
    error.status = 404;
    throw error;
  }

  const spec = normalizeSpecs(body);
  const gallery = body.gallery === undefined ? existing.gallery : normalizeGalleryForDb(body);
  const ok = await carRepository.updateCarById(id, {
    name: body.name,
    price: body.price,
    year: body.year,
    image: body.image,
    ...spec,
    gallery,
  });

  if (!ok) {
    const error = new Error("Vetura nuk u përditësua");
    error.status = 500;
    throw error;
  }

  await saveCarLog({
    action: "update",
    carId: id,
    userId,
    carName: body.name,
  });

  return { message: "Vetura u përditësua me sukses" };
}

async function deleteCar(id, userId) {
  const existing = await carRepository.getCarById(id);
  if (!existing) {
    const error = new Error("Vetura nuk u gjet");
    error.status = 404;
    throw error;
  }

  const ok = await carRepository.deleteCarById(id);
  if (!ok) {
    const error = new Error("Vetura nuk u fshi");
    error.status = 500;
    throw error;
  }

  await saveCarLog({
    action: "delete",
    carId: id,
    userId,
    carName: existing.name,
  });

  return { message: "Vetura u fshi me sukses" };
}

module.exports = {
  listCars,
  getCarDetails,
  createCar,
  updateCar,
  deleteCar,
};
