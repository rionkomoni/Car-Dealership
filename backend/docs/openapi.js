module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Car Dealership API",
    version: "1.0.0",
    description:
      "REST API OpenAPI 3.0.3: JWT + OAuth2 (password flow), rate limiting, caching, HATEOAS, versionim /api/v1. " +
      "Swagger UI: /api-docs · Spec JSON: /openapi.json",
  },
  servers: [
    { url: "http://localhost:5000", description: "Development" },
    { url: "https://localhost:8443", description: "API Gateway (TLS)" },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Cars" },
    { name: "Admin" },
    { name: "Manager" },
    { name: "Uploads" },
    { name: "Integrations" },
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
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      ActivationRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["current_password", "new_password"],
        properties: {
          current_password: { type: "string" },
          new_password: { type: "string", minLength: 6 },
        },
      },
      PasswordResetRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      PasswordResetConfirmRequest: {
        type: "object",
        required: ["token", "new_password"],
        properties: {
          token: { type: "string" },
          new_password: { type: "string", minLength: 6 },
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
          _links: { $ref: "#/components/schemas/HateoasLinks" },
        },
      },
      HateoasLink: {
        type: "object",
        properties: {
          href: { type: "string" },
          method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        },
        required: ["href"],
      },
      HateoasLinks: {
        type: "object",
        additionalProperties: { $ref: "#/components/schemas/HateoasLink" },
        example: {
          self: { href: "/api/v1/cars/1" },
          collection: { href: "/api/v1/cars" },
          purchase: { href: "/api/v1/cars/1/purchase", method: "POST" },
        },
      },
      PaginatedCarsResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Car" } },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              page: { type: "integer" },
              pageSize: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
          _links: { $ref: "#/components/schemas/HateoasLinks" },
        },
      },
      RateLimitHeaders: {
        type: "object",
        description: "RFC 6585 style headers (express-rate-limit standardHeaders)",
        properties: {
          "RateLimit-Limit": { type: "integer" },
          "RateLimit-Remaining": { type: "integer" },
          "RateLimit-Reset": { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Process health + service registry",
        responses: { 200: { description: "OK with services map and layers" } },
      },
    },
    "/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe (MySQL + MongoDB)",
        responses: {
          200: { description: "Ready" },
          503: { description: "Not ready" },
        },
      },
    },
    "/openapi.json": {
      get: {
        tags: ["Health"],
        summary: "OpenAPI 3.0 specification (JSON)",
        responses: { 200: { description: "OpenAPI document" } },
      },
    },
    "/api/v1/openapi.json": {
      get: {
        tags: ["Health"],
        summary: "Versioned OpenAPI spec",
        responses: { 200: { description: "Same as /openapi.json" } },
      },
    },
    "/api/v1/integrations/discovery": {
      get: {
        tags: ["Integrations"],
        summary: "Service discovery + layer architecture map",
        responses: { 200: { description: "Registry, modules, Consul status" } },
      },
    },
    "/api/v1/integrations/messaging/status": {
      get: {
        tags: ["Integrations"],
        summary: "Message bus and cache backend status",
        responses: { 200: { description: "RabbitMQ/local + Redis/memory" } },
      },
    },
    "/api/v1/integrations/consul/services": {
      get: {
        tags: ["Integrations"],
        summary: "List healthy service instances from Consul (when CONSUL_ENABLED)",
        responses: {
          200: { description: "Consul catalog entries" },
          503: { description: "Consul unavailable" },
        },
      },
    },
    "/api/v1/integrations/messaging/test-event": {
      post: {
        tags: ["Integrations"],
        summary: "Publish a test event to the message bus",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  event: { type: "string", example: "system.test" },
                  payload: { type: "object" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Event published" } },
      },
    },
    "/api/v1/integrations/sync/health-through-breaker": {
      get: {
        tags: ["Integrations"],
        summary: "Internal health call wrapped in circuit breaker",
        responses: {
          200: { description: "Upstream healthy" },
          503: { description: "Circuit open or upstream error" },
        },
      },
    },
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
        summary: "Login and receive access + refresh tokens",
        security: [{ oauth2: [] }],
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
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token (rotation) using refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          200: { description: "New access + refresh token" },
          401: { description: "Invalid/expired refresh token" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke refresh token (logout)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          200: { description: "Logged out" },
        },
      },
    },
    "/api/v1/users/me": {
      get: {
        tags: ["Auth", "Users"],
        summary: "Get current user profile (JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User profile from token" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users/me/purchases": {
      get: {
        tags: ["Users"],
        summary: "List purchases for the authenticated user (by email in JWT)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Paginated-style list with data + meta" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users/me/test-drives": {
      get: {
        tags: ["Users"],
        summary: "List test-drive requests for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "List with data + meta" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users/me/wishlist": {
      get: {
        tags: ["Users"],
        summary: "List wishlist cars for authenticated user",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "data + ids" } },
      },
    },
    "/api/v1/users/me/wishlist/sync": {
      post: {
        tags: ["Users"],
        summary: "Merge local wishlist ids into database",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Synced ids" } },
      },
    },
    "/api/v1/users/me/wishlist/{carId}": {
      post: {
        tags: ["Users"],
        summary: "Add car to wishlist",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "carId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 201: { description: "Added" } },
      },
      delete: {
        tags: ["Users"],
        summary: "Remove car from wishlist",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "carId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Removed" } },
      },
    },
    "/api/v1/admin/test-drives": {
      get: {
        tags: ["Admin"],
        summary: "List all test-drive requests (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Test-drive list" },
          401: { description: "Unauthorized" },
          403: { description: "Admin required" },
        },
      },
    },
    "/api/v1/admin/test-drives/{id}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Update test-drive status",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["pending", "scheduled", "completed", "cancelled"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status updated" },
          400: { description: "Validation error" },
          404: { description: "Not found" },
          409: { description: "Slot conflict" },
        },
      },
    },
    "/api/v1/users/activation/request": {
      post: {
        tags: ["Users"],
        summary: "Request account activation link (public)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ActivationRequest" },
            },
          },
        },
        responses: {
          200: { description: "Activation link response (non-enumerating)" },
        },
      },
    },
    "/api/v1/users/activate": {
      get: {
        tags: ["Users"],
        summary: "Activate account by token (public)",
        parameters: [
          { name: "token", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Account activated" },
          400: { description: "Invalid/expired token" },
        },
      },
    },
    "/api/v1/users/me/password": {
      post: {
        tags: ["Users"],
        summary: "Change password with current password verification (JWT required)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password changed" },
          400: { description: "Bad request / current password invalid" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/users/password/reset/request": {
      post: {
        tags: ["Users"],
        summary: "Request password reset email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordResetRequest" },
            },
          },
        },
        responses: {
          200: { description: "Reset request accepted" },
        },
      },
    },
    "/api/v1/users/password/reset/confirm": {
      post: {
        tags: ["Users"],
        summary: "Confirm password reset with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordResetConfirmRequest" },
            },
          },
        },
        responses: {
          200: { description: "Password reset success" },
          400: { description: "Invalid/expired/used token" },
        },
      },
    },
    "/api/v1/cars": {
      get: {
        tags: ["Cars"],
        summary: "List cars with filters (cached ~2 min, rate limited)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 12 } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "availableOnly", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          200: {
            description: "Paginated list; each item includes _links (self, purchase, test-drive)",
            headers: {
              "RateLimit-Limit": { schema: { type: "integer" } },
              "RateLimit-Remaining": { schema: { type: "integer" } },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedCarsResponse" },
              },
            },
          },
          429: { description: "Rate limit exceeded" },
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
    "/api/v1/admin/audit-logs": {
      get: {
        tags: ["Admin"],
        summary: "List latest audit logs (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Audit log list" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/analytics": {
      get: {
        tags: ["Admin"],
        summary: "Business analytics snapshot (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Revenue and trade-in analytics" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/charts": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard chart datasets (admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description:
              "Purchases by month, inventory, test-drives, body types, revenue",
          },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/admin/charts": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard chart datasets (legacy path)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Same as /api/v1/admin/charts" },
        },
      },
    },
    "/api/uploads/car-image": {
      post: {
        tags: ["Uploads", "Admin"],
        summary: "Upload single car image (admin JWT, multipart)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Image stored under /uploads/cars/" },
          400: { description: "Invalid file" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/uploads/car-images": {
      post: {
        tags: ["Uploads", "Admin"],
        summary: "Upload multiple car images (admin JWT, max 12)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Files stored" },
          400: { description: "Invalid files" },
          403: { description: "Admin access required" },
        },
      },
    },
    "/api/v1/admin/cars-inventory": {
      get: {
        tags: ["Admin"],
        summary: "Full cars inventory for admin (no pagination; admin JWT required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "All vehicles with parsed gallery" },
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
    "/api/v1/manager/invoices/{purchaseId}": {
      get: {
        tags: ["Manager"],
        summary: "Generate invoice view from purchase (manager/admin JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "purchaseId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Invoice payload" },
          401: { description: "Unauthorized" },
          403: { description: "Manager or admin access required" },
          404: { description: "Purchase not found" },
        },
      },
    },
    "/api/v1/manager/invoices/{purchaseId}/pdf": {
      get: {
        tags: ["Manager"],
        summary: "Download purchase invoice as PDF (manager/admin JWT required)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "purchaseId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: {
            description: "application/pdf attachment",
            content: { "application/pdf": { schema: { type: "string", format: "binary" } } },
          },
          404: { description: "Purchase not found" },
        },
      },
    },
    "/api/manager/invoices/{purchaseId}/pdf": {
      get: {
        tags: ["Manager"],
        summary: "Download invoice PDF (legacy path)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "purchaseId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "application/pdf" },
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
