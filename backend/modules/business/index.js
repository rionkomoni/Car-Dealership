/**
 * Moduli i operacioneve biznesore — vetura, kontakt, logje (shkrim) përmes shërbimeve ekzistuese.
 */
module.exports = [
  {
    name: "businessOperations-cars",
    basePath: "/api/cars",
    router: require("../../routes/carRoutes"),
  },
  {
    name: "businessOperations-contact",
    basePath: "/api/contact",
    router: require("../../routes/contactRoutes"),
  },
];
