const InventoryCar = require("../backend/domain/entities/InventoryCar");
const TradeInVehicle = require("../backend/domain/entities/TradeInVehicle");
const PurchaseQuote = require("../backend/domain/entities/PurchaseQuote");

describe("domain entities (phase 5)", () => {
  test("calculates amount_to_add with trade-in", () => {
    const car = new InventoryCar({
      id: 10,
      name: "Audi Q8",
      year: 2022,
      price: 40000,
      sold_out: 0,
      mileage_km: 50000,
    });
    const tradeIn = new TradeInVehicle({
      current_car: "VW Golf",
      year: 2016,
      mileage_km: 120000,
      estimated_value: 7000,
    });

    const quote = new PurchaseQuote({ inventoryCar: car, tradeInVehicle: tradeIn });

    expect(quote.calculateAmountToAdd()).toBe(33000);
  });

  test("throws when attempting quote for sold out car", () => {
    const car = new InventoryCar({
      id: 11,
      name: "BMW M4",
      year: 2023,
      price: 78000,
      sold_out: 1,
      mileage_km: 10000,
    });
    const quote = new PurchaseQuote({ inventoryCar: car });

    expect(() => quote.validateBusinessRules()).toThrow(/sold out/i);
  });
});

