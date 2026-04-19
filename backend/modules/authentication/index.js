/**
 * Moduli i autentikimit — API publike nën /api/auth
 */
module.exports = [
  {
    name: "authentication",
    basePath: "/api/auth",
    router: require("../../routes/authRoutes"),
  },
];
