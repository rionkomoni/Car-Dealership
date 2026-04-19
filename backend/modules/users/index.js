/**
 * Moduli i menaxhimit të përdoruesve — API nën /api/users
 */
module.exports = [
  {
    name: "users",
    basePath: "/api/users",
    router: require("../../routes/userRoutes"),
  },
];
