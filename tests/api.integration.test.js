const request = require("supertest");

jest.mock("../backend/config/mongo", () => jest.fn(async () => {}));
jest.mock("../backend/config/mysql", () => ({
  query: jest.fn(async () => [[]]),
}));
jest.mock("../backend/db/seedSampleCars", () => ({
  ensureCarSpecColumns: jest.fn(async () => {}),
  seedSampleCarsIfEmpty: jest.fn(async () => {}),
}));
jest.mock("../backend/db/seedAdmin", () => ({
  seedAdminUser: jest.fn(async () => {}),
}));

const { app } = require("../backend/index");

describe("API integration (lightweight)", () => {
  test("GET / should return API status text", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  test("GET /api/v1/health should return versioned health payload", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.version).toBe("v1");
  });

  test("GET /api-docs should be reachable", async () => {
    const response = await request(app).get("/api-docs");
    expect([200, 301, 302]).toContain(response.status);
  });
});
