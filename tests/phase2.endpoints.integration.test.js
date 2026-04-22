const request = require("supertest");
const jwt = require("jsonwebtoken");

const mockQuery = jest.fn();
const mockGetConnection = jest.fn();

jest.mock("../backend/config/mongo", () => jest.fn(async () => {}));
jest.mock("../backend/config/mysql", () => ({
  query: mockQuery,
  getConnection: mockGetConnection,
}));
jest.mock("../backend/db/seedSampleCars", () => ({
  ensureCarSpecColumns: jest.fn(async () => {}),
  seedSampleCarsIfEmpty: jest.fn(async () => {}),
}));
jest.mock("../backend/db/seedAdmin", () => ({
  seedAdminUser: jest.fn(async () => {}),
}));

const { app } = require("../backend/index");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "sekreti123");
}

describe("Phase 2 endpoint coverage", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockGetConnection.mockReset();
  });

  test("PATCH /api/cars/:id/sold-out updates status for admin", async () => {
    const adminToken = signToken({ id: 1, role: "admin", email: "admin@gmail.com" });

    mockQuery.mockResolvedValueOnce([[{ name: "Audi Q8" }]]); // select by id
    mockQuery.mockResolvedValueOnce([{}]); // update

    const response = await request(app)
      .patch("/api/cars/12/sold-out")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ sold_out: true });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/sold out/i);
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      "UPDATE cars SET sold_out = ? WHERE id = ?",
      [1, 12]
    );
  });

  test("POST /api/cars/:id/purchase calculates amount_to_add with trade-in", async () => {
    const userToken = signToken({ id: 3, role: "client", email: "user@test.com" });
    const conn = {
      beginTransaction: jest.fn(async () => {}),
      commit: jest.fn(async () => {}),
      rollback: jest.fn(async () => {}),
      release: jest.fn(() => {}),
      query: jest
        .fn()
        .mockResolvedValueOnce([[{ id: 5, name: "BMW X5", price: 30000, sold_out: 0 }]])
        .mockResolvedValueOnce([{}]) // insert purchase
        .mockResolvedValueOnce([{}]), // update sold_out
    };
    mockGetConnection.mockResolvedValue(conn);

    const response = await request(app)
      .post("/api/cars/5/purchase")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        buyer_name: "Test Buyer",
        buyer_email: "buyer@test.com",
        payment_method: "cash",
        trade_in: {
          current_car: "VW Golf 2015",
          year: 2015,
          mileage_km: 130000,
          estimated_value: 5000,
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.purchase.amount_to_add).toBe(25000);
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test("GET /api/admin/purchases returns purchase list for admin", async () => {
    const adminToken = signToken({ id: 1, role: "admin", email: "admin@gmail.com" });

    mockQuery.mockResolvedValueOnce([
      [
        {
          id: 1,
          car_id: 7,
          car_name: "Mercedes GLE",
          amount_to_add: 12000,
        },
      ],
    ]);

    const response = await request(app)
      .get("/api/admin/purchases")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].car_name).toBe("Mercedes GLE");
  });
});

