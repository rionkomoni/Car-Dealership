/**
 * Service Discovery — hartë e moduleve logjike (monolith modular).
 * Çdo hyrje mund të bëhet microservice i pavarur në deploy të ardhshëm.
 */
const serviceRegistry = {
  authentication: {
    type: "module",
    layer: "presentation+business",
    deployUnit: "auth-service",
    doc: "backend/modules/authentication/README.md",
    routeBase: "/api/auth",
    healthProbe: "/api/auth/login",
    scalable: true,
  },
  users: {
    type: "module",
    layer: "presentation+business+persistence",
    deployUnit: "users-service",
    doc: "backend/modules/users/README.md",
    routeBase: "/api/users",
    scalable: true,
  },
  businessOperations: {
    type: "module",
    layer: "presentation+business+persistence",
    deployUnit: "catalog-service",
    doc: "backend/modules/business/README.md",
    routeBases: ["/api/cars", "/api/contact", "/api/uploads"],
    scalable: true,
  },
  reporting: {
    type: "module",
    layer: "presentation+business+persistence",
    deployUnit: "reporting-service",
    doc: "backend/modules/reporting/README.md",
    routeBases: ["/api/admin", "/api/manager", "/api/car-logs"],
    scalable: true,
  },
};

function getServiceRegistry() {
  return serviceRegistry;
}

function listServiceEntries() {
  return Object.entries(serviceRegistry).map(([name, meta]) => ({
    name,
    ...meta,
  }));
}

module.exports = {
  serviceRegistry,
  getServiceRegistry,
  listServiceEntries,
};
