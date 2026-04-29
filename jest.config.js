module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "backend/domain/entities/InventoryCar.js",
    "backend/domain/entities/TradeInVehicle.js",
    "backend/domain/entities/PurchaseQuote.js",
    "backend/lib/circuitBreaker.js",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
