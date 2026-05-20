/**
 * Hartë e shtresave (Layered Architecture) — Presentation, Business, Persistence, Integration.
 * Përdoret nga /health dhe /api/v1/integrations/discovery për dokumentim dhe mbrojtje akademike.
 */
const LAYER_ARCHITECTURE = {
  presentation: {
    label: "Presentation Layer",
    responsibility:
      "UI, routing, validim i hyrjeve HTTP, serializim përgjigjesh; nuk përmban rregulla biznesi.",
    backend: [
      "backend/routes/",
      "backend/middleware/auth.js",
      "backend/middleware/requireAdmin.js",
      "backend/middleware/attachUserFromToken.js",
    ],
    frontend: [
      "frontend/src/Pages/",
      "frontend/src/components/",
      "frontend/src/App.js",
    ],
    pattern: "MVC (server) + MVVM (React/Redux)",
  },
  business: {
    label: "Business Logic Layer",
    responsibility:
      "Rregulla domeni, llogaritje trade-in, fatura, autorizim role, orkestrim use-case.",
    paths: [
      "backend/controllers/",
      "backend/services/",
      "backend/application/services/",
      "backend/domain/entities/",
      "backend/domain/services/",
    ],
    pattern: "Service + Domain entities",
  },
  persistence: {
    label: "Persistence Layer",
    responsibility:
      "Akses i të dhënave (SQL/NoSQL), transaksione, repository; pa logjikë prezantimi.",
    paths: [
      "backend/repositories/",
      "backend/dal/",
      "backend/config/mysql.js",
      "backend/config/mongo.js",
      "backend/models/",
      "backend/db/",
    ],
    pattern: "Repository + ORM (Sequelize/Mongoose) + mysql2",
  },
  integration: {
    label: "Integration Layer",
    responsibility:
      "Gateway, service discovery, message bus, email, cache, thirrje të jashtme.",
    paths: [
      "backend/integrations/",
      "deploy/nginx/api-gateway.conf",
      "docker-compose.gateway.yml",
      "k8s/",
    ],
    pattern: "Adapters (RabbitMQ, Redis, Consul, Nginx)",
  },
};

const MODULE_TO_LAYER = {
  authentication: "presentation",
  users: { route: "presentation", service: "business", repo: "persistence" },
  businessOperations: { route: "presentation", service: "business", repo: "persistence" },
  reporting: { route: "presentation", service: "business", repo: "persistence" },
};

function getLayerArchitecture() {
  return {
    model: "Layered Monolith (gati për ndarje microservice)",
    layers: LAYER_ARCHITECTURE,
    moduleLayerHints: MODULE_TO_LAYER,
  };
}

module.exports = {
  LAYER_ARCHITECTURE,
  getLayerArchitecture,
};
