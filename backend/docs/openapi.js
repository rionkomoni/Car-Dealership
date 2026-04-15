module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Car Dealership API",
    version: "1.0.0",
    description: "REST API me JWT auth, versionim dhe HATEOAS links.",
  },
  servers: [{ url: "http://localhost:5000" }],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Cars" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      oauth2: {
        type: "oauth2",
        flows: {
          password: {
            tokenUrl: "/api/v1/auth/login",
            scopes: {},
          },
        },
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      Car: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          price: { type: "number" },
          year: { type: "integer" },
          image: { type: "string" },
          _links: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Health endpoint",
        responses: {
          200: {
            description: "API is healthy",
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Logged in" },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/v1/cars": {
      get: {
        tags: ["Cars"],
        summary: "Get all cars (cached)",
        responses: {
          200: { description: "List of cars with HATEOAS links" },
        },
      },
      post: {
        tags: ["Cars"],
        summary: "Create car (JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Car created" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/cars/{id}": {
      get: {
        tags: ["Cars"],
        summary: "Get car by id (cached)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Car details with HATEOAS links" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Cars"],
        summary: "Update car (JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Updated" },
          401: { description: "Unauthorized" },
        },
      },
      delete: {
        tags: ["Cars"],
        summary: "Delete car (JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Deleted" },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};
