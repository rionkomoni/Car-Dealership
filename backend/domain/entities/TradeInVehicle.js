const AbstractVehicle = require("./AbstractVehicle");

class TradeInVehicle extends AbstractVehicle {
  constructor({ current_car, year, mileage_km, estimated_value }) {
    super({
      name: current_car,
      year,
      mileageKm: mileage_km,
      estimatedValue: estimated_value,
    });
    this.validateCommon();
  }

  toDbShape() {
    return {
      trade_in_car: this.name,
      trade_in_year: this.year,
      trade_in_mileage_km: this.mileageKm,
      trade_in_value: this.estimatedValue,
    };
  }
}

module.exports = TradeInVehicle;

