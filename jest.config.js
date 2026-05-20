module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "backend/domain/entities/InventoryCar.js",
    "backend/domain/entities/TradeInVehicle.js",
    "backend/domain/entities/PurchaseQuote.js",
    "backend/lib/circuitBreaker.js",
    "backend/services/authService.js",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    "./backend/domain/entities/": {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    "./backend/services/authService.js": {
      statements: 75,
      branches: 70,
      functions: 80,
      lines: 75,
    },
  },
};
