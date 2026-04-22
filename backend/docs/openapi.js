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
    { name: "Admin" },
    { name: "Manager" },
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
      PurchaseRequest: {
        type: "object",
        required: ["buyer_name", "buyer_email", "payment_method"],
        properties: {
          buyer_name: { type: "string" },
          buyer_email: { type: "string", format: "email" },
          buyer_phone: { type: "string", nullable: true },
          payment_method: {
            type: "string",
            enum: ["cash", "bank_transfer", "financing", "leasing"],
          },
          notes: { type: "string", nullable: true },
          trade_in: {
            type: "object",
            nullable: true,
            required: ["current_car", "year", "mileage_km", "estimated_value"],
            properties: {
              current_car: { type: "string" },
              year: { type: "integer" },
              mileage_km: { type: "integer" },
              estimated_value: { type: "number" },
            },
          },
        },
      },
      SoldOutRequest: {
        type: "object",
        required: ["sold_out"],
        properties: {
          sold_out: { type: "boolean" },
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
          sold_out: { type: "integer", enum: [0, 1] },
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
        summary: "Delete car (admin JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/cars/{id}/sold-out": {
      patch: {
        tags: ["Cars", "Admin"],
        summary: "Toggle sold out state (admin JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SoldOutRequest" },
            },
          },
        },
        responses: {
          200: { description: "Sold out status updated" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "Car not found" },
        },
      },
    },
    "/api/v1/cars/{id}/purchase": {
      post: {
        tags: ["Cars"],
        summary: "Purchase vehicle and mark sold out (JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PurchaseRequest" },
            },
          },
        },
        responses: {
          201: { description: "Purchase created; car set to sold out" },
          401: { description: "Unauthorized" },
          404: { description: "Car not found" },
          409: { description: "Car already sold out" },
        },
      },
    },
    "/api/v1/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Admin dashboard stats (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Stats payload" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/contacts": {
      get: {
        tags: ["Admin"],
        summary: "List contact messages (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Contact list" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/purchases": {
      get: {
        tags: ["Admin"],
        summary: "List purchases and trade-in data (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Purchase list" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/manager/overview": {
      get: {
        tags: ["Manager"],
        summary: "Manager operational overview (manager/admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Overview metrics and latest purchases" },
          401: { description: "Unauthorized" },
          403: { description: "Manager or admin access required" },
        },
      },
    },
    "/api/v1/manager/trade-ins/pending": {
      get: {
        tags: ["Manager"],
        summary: "List pending trade-in reviews (manager/admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Pending trade-ins list" },
          401: { description: "Unauthorized" },
          403: { description: "Manager or admin access required" },
        },
      },
    },
    "/api/v1/manager/trade-ins/{purchaseId}/decision": {
      patch: {
        tags: ["Manager"],
        summary: "Approve or reject trade-in by purchase id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "purchaseId", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["decision"],
                properties: {
                  decision: { type: "string", enum: ["approved", "rejected"] },
                  review_note: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Trade-in decision saved" },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
          403: { description: "Manager or admin access required" },
          404: { description: "Purchase not found" },
          409: { description: "Trade-in already reviewed" },
        },
      },
    },
  },
};
