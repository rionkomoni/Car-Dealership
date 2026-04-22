/**
 * Moduli i statistikave dhe raportimit — dashboard admin + logje.
 */
module.exports = [
  {
    name: "reporting-admin",
    basePath: "/api/admin",
    router: require("../../routes/adminRoutes"),
  },
  {
    name: "reporting-manager",
    basePath: "/api/manager",
    router: require("../../routes/managerRoutes"),
  },
  {
    name: "reporting-carLogs",
    basePath: "/api/car-logs",
    router: require("../../routes/carLogRoutes"),
  },
];
