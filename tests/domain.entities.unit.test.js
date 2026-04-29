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

  test("clamps amount_to_add to zero when trade-in exceeds price", () => {
    const car = new InventoryCar({
      id: 12,
      name: "VW Polo",
      year: 2020,
      price: 10000,
      sold_out: 0,
      mileage_km: 90000,
    });
    const tradeIn = new TradeInVehicle({
      current_car: "Audi A6",
      year: 2019,
      mileage_km: 80000,
      estimated_value: 13000,
    });
    const quote = new PurchaseQuote({ inventoryCar: car, tradeInVehicle: tradeIn });

    expect(quote.calculateAmountToAdd()).toBe(0);
  });

  test("throws when trade-in value is unrealistically high", () => {
    const car = new InventoryCar({
      id: 13,
      name: "Skoda Octavia",
      year: 2021,
      price: 12000,
      sold_out: 0,
      mileage_km: 70000,
    });
    const tradeIn = new TradeInVehicle({
      current_car: "BMW X5",
      year: 2020,
      mileage_km: 40000,
      estimated_value: 40000,
    });
    const quote = new PurchaseQuote({ inventoryCar: car, tradeInVehicle: tradeIn });

    expect(() => quote.validateBusinessRules()).toThrow(/unrealistically high/i);
  });

  test("maps trade-in vehicle to DB shape", () => {
    const tradeIn = new TradeInVehicle({
      current_car: "Honda Civic",
      year: 2018,
      mileage_km: 110000,
      estimated_value: 6000,
    });

    expect(tradeIn.toDbShape()).toEqual({
      trade_in_car: "Honda Civic",
      trade_in_year: 2018,
      trade_in_mileage_km: 110000,
      trade_in_value: 6000,
    });
  });

  test("throws when inventory car id is invalid", () => {
    expect(
      () =>
        new InventoryCar({
          id: 0,
          name: "Test",
          year: 2022,
          price: 10000,
          sold_out: 0,
          mileage_km: 1000,
        })
    ).toThrow(/id is invalid/i);
  });
});

