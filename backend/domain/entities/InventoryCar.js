const AbstractVehicle = require("./AbstractVehicle");

class InventoryCar extends AbstractVehicle {
  constructor({ id, name, year, price, sold_out, mileage_km }) {
    super({
      name,
      year,
      mileageKm: mileage_km,
      estimatedValue: price,
    });
    this.id = Number(id);
    this.price = Number(price);
    this.soldOut = Number(sold_out) === 1;
    this.validateCommon();
    this.validateSpecific();
  }

  validateSpecific() {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      throw new Error("Inventory car id is invalid.");
    }
    if (!Number.isFinite(this.price) || this.price <= 0) {
      throw new Error("Inventory car price must be greater than zero.");
    }
  }
}

module.exports = InventoryCar;

