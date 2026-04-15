const serviceRegistry = {
  authService: {
    type: "internal",
    module: "backend/services/authService",
    routeBase: "/api/auth",
  },
  carsService: {
    type: "internal",
    module: "backend/services/carService",
    routeBase: "/api/cars",
  },
  adminService: {
    type: "internal",
    module: "backend/services/adminService",
    routeBase: "/api/admin",
  },
  contactService: {
    type: "internal",
    module: "backend/routes/contactRoutes",
    routeBase: "/api/contact",
  },
  carLogsService: {
    type: "internal",
    module: "backend/routes/carLogRoutes",
    routeBase: "/api/car-logs",
  },
};

function getServiceRegistry() {
  return serviceRegistry;
}

module.exports = {
  getServiceRegistry,
};
