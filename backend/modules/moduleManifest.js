/**
 * Manifest i moduleve — interfaqe publike, dokumentim, logging.
 * Përdoret nga GET /api/v1/integrations/discovery.
 */
const moduleManifest = [
  {
    id: "authentication",
    title: "Moduli i Autentikimit",
    publicApiBase: "/api/auth",
    versionedApiBase: "/api/v1/auth",
    documentation: "backend/modules/authentication/README.md",
    loggingChannel: "module:authentication",
    responsibilities: ["register", "login", "JWT", "refresh token", "logout"],
    dependsOn: ["MySQL users"],
    routesFile: "backend/routes/authRoutes.js",
  },
  {
    id: "users",
    title: "Moduli i Menaxhimit të Përdoruesve",
    publicApiBase: "/api/users",
    versionedApiBase: "/api/v1/users",
    documentation: "backend/modules/users/README.md",
    loggingChannel: "module:users",
    responsibilities: [
      "profile",
      "wishlist",
      "my purchases",
      "my test-drives",
      "activation",
      "password reset",
      "admin user CRUD",
    ],
    dependsOn: ["MySQL users", "wishlists", "messageBus events"],
    routesFile: "backend/routes/userRoutes.js",
  },
  {
    id: "businessOperations",
    title: "Moduli i Operacioneve Biznesore",
    publicApiBases: ["/api/cars", "/api/contact", "/api/uploads"],
    versionedApiBases: ["/api/v1/cars", "/api/v1/contact"],
    documentation: "backend/modules/business/README.md",
    loggingChannel: "module:businessOperations",
    responsibilities: [
      "inventory CRUD",
      "purchase",
      "test-drive",
      "contact form",
      "image upload",
    ],
    dependsOn: ["MySQL cars/purchases", "MongoDB contact", "filesystem uploads"],
    routesFiles: [
      "backend/routes/carRoutes.js",
      "backend/routes/contactRoutes.js",
      "backend/routes/uploadRoutes.js",
    ],
  },
  {
    id: "reporting",
    title: "Moduli i Statistikave & Raportimit",
    publicApiBases: ["/api/admin", "/api/manager", "/api/car-logs"],
    versionedApiBases: ["/api/v1/admin", "/api/v1/manager", "/api/v1/car-logs"],
    documentation: "backend/modules/reporting/README.md",
    loggingChannel: "module:reporting",
    responsibilities: [
      "admin stats & charts",
      "purchases & test-drive admin",
      "manager overview",
      "trade-in decisions",
      "invoice PDF",
      "car activity logs",
    ],
    dependsOn: ["MySQL", "MongoDB", "BusinessLogicService"],
    routesFiles: [
      "backend/routes/adminRoutes.js",
      "backend/routes/managerRoutes.js",
      "backend/routes/carLogRoutes.js",
    ],
  },
];

function getModuleManifest() {
  return moduleManifest;
}

module.exports = { moduleManifest, getModuleManifest };
