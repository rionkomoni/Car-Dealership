const request = require("supertest");
const jwt = require("jsonwebtoken");

const mockQuery = jest.fn();

jest.mock("../backend/config/mongo", () => jest.fn(async () => {}));
jest.mock("../backend/config/mysql", () => ({
  query: mockQuery,
  getConnection: jest.fn(),
}));
jest.mock("../backend/db/seedSampleCars", () => ({
  ensureCarSpecColumns: jest.fn(async () => {}),
  seedSampleCarsIfEmpty: jest.fn(async () => {}),
  syncSampleCarsByName: jest.fn(async () => {}),
}));
jest.mock("../backend/db/seedAdmin", () => ({
  seedAdminUser: jest.fn(async () => {}),
}));
jest.mock("../backend/db/runMigrations", () => ({
  runSqlMigrations: jest.fn(async () => {}),
}));

const { app } = require("../backend/index");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "sekreti123");
}

describe("API v1 integration", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test("GET /api/v1/health returns version and HATEOAS links", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.version).toBe("v1");
    expect(res.body._links.docs.href).toBe("/api-docs");
  });

  test("GET /openapi.json returns OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.paths["/api/v1/cars"]).toBeDefined();
  });

  test("GET /api/v1/integrations/discovery exposes registry", async () => {
    const res = await request(app).get("/api/v1/integrations/discovery");
    expect(res.status).toBe(200);
    expect(res.body.serviceRegistry).toBeDefined();
    expect(res.body.layers).toBeDefined();
    expect(Array.isArray(res.body.moduleManifest)).toBe(true);
    expect(res.body.moduleManifest.length).toBe(4);
  });

  test("GET /api/v1/cars returns paginated HATEOAS payload", async () => {
    mockQuery
      .mockResolvedValueOnce([
        [
          {
            id: 1,
            name: "Audi Q8",
            price: 62000,
            year: 2022,
            sold_out: 0,
            gallery: null,
          },
        ],
      ])
      .mockResolvedValueOnce([[{ total: 1 }]]);

    const res = await request(app).get("/api/v1/cars?page=1&pageSize=12");
    expect(res.status).toBe(200);
    expect(res.body.data[0]._links.self.href).toContain("/cars/1");
    expect(res.body.data[0]._links.purchase).toMatchObject({
      method: "POST",
    });
    expect(res.body._links.self).toBeDefined();
    expect(res.body.meta.total).toBe(1);
  });

  test("rate limit headers are present on versioned API routes", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });

  test("GET /api/v1/users/me requires JWT", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/v1/users/me returns profile when authenticated", async () => {
    const token = signToken({
      id: 2,
      name: "Test User",
      role: "client",
      email: "user@test.com",
    });

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user@test.com");
    expect(res.body.name).toBe("Test User");
  });
});
