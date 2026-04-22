const serviceRegistry = {
  authentication: {
    type: "module",
    doc: "backend/modules/authentication/README.md",
    routeBase: "/api/auth",
  },
  users: {
    type: "module",
    doc: "backend/modules/users/README.md",
    routeBase: "/api/users",
  },
  businessOperations: {
    type: "module",
    doc: "backend/modules/business/README.md",
    routeBases: ["/api/cars", "/api/contact"],
  },
  reporting: {
    type: "module",
    doc: "backend/modules/reporting/README.md",
    routeBases: ["/api/admin", "/api/manager", "/api/car-logs"],
  },
};

function getServiceRegistry() {
  return serviceRegistry;
}

module.exports = {
  getServiceRegistry,
};
