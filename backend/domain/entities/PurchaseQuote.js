class PurchaseQuote {
  constructor({ inventoryCar, tradeInVehicle = null }) {
    this.inventoryCar = inventoryCar;
    this.tradeInVehicle = tradeInVehicle;
  }

  getTradeInValue() {
    return this.tradeInVehicle ? Number(this.tradeInVehicle.estimatedValue) : 0;
  }

  calculateAmountToAdd() {
    const amount = this.inventoryCar.price - this.getTradeInValue();
    return Math.max(0, Number(amount.toFixed(2)));
  }

  validateBusinessRules() {
    if (this.inventoryCar.soldOut) {
      throw new Error("Kjo veturë është tashmë sold out.");
    }

    const tradeValue = this.getTradeInValue();
    if (tradeValue < 0) {
      throw new Error("Trade-in value cannot be negative.");
    }

    // Business sanity cap to avoid accidental unrealistic values.
    if (tradeValue > this.inventoryCar.price * 3) {
      throw new Error("Trade-in value is unrealistically high.");
    }
  }
}

module.exports = PurchaseQuote;

