class AbstractVehicle {
  constructor({ name, year, mileageKm = null, estimatedValue = null }) {
    if (new.target === AbstractVehicle) {
      throw new TypeError("AbstractVehicle cannot be instantiated directly.");
    }
    this.name = String(name || "").trim();
    this.year = Number(year);
    this.mileageKm = mileageKm == null ? null : Number(mileageKm);
    this.estimatedValue = estimatedValue == null ? null : Number(estimatedValue);
  }

  validateCommon() {
    if (!this.name) {
      throw new Error("Vehicle name is required.");
    }
    if (!Number.isInteger(this.year) || this.year < 1950 || this.year > 2100) {
      throw new Error("Vehicle year is invalid.");
    }
    if (this.mileageKm != null && (!Number.isFinite(this.mileageKm) || this.mileageKm < 0)) {
      throw new Error("Vehicle mileage is invalid.");
    }
    if (
      this.estimatedValue != null &&
      (!Number.isFinite(this.estimatedValue) || this.estimatedValue < 0)
    ) {
      throw new Error("Vehicle estimated value is invalid.");
    }
  }
}

module.exports = AbstractVehicle;

