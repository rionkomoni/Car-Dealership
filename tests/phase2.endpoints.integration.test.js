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
        .mockResolvedValueOnce([
          [{ id: 5, name: "BMW X5", year: 2022, mileage_km: 24000, price: 30000, sold_out: 0 }],
        ])
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

  test("GET /api/manager/trade-ins/pending returns pending items for manager role", async () => {
    const managerToken = signToken({
      id: 10,
      role: "manager",
      email: "manager@gmail.com",
    });

    mockQuery.mockResolvedValueOnce([
      [
        {
          id: 4,
          car_id: 2,
          car_name: "Audi Q8",
          trade_in_car: "VW Golf",
          trade_in_status: "pending",
        },
      ],
    ]);

    const response = await request(app)
      .get("/api/manager/trade-ins/pending")
      .set("Authorization", `Bearer ${managerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].trade_in_status).toBe("pending");
  });

  test("PATCH /api/manager/trade-ins/:purchaseId/decision updates rejected review", async () => {
    const managerToken = signToken({
      id: 10,
      role: "manager",
      email: "manager@gmail.com",
    });

    mockQuery
      .mockResolvedValueOnce([
        [
          {
            id: 4,
            car_price: 30000,
            trade_in_value: 5000,
            trade_in_status: "pending",
            trade_in_car: "VW Golf",
          },
        ],
      ])
      .mockResolvedValueOnce([{}]);

    const response = await request(app)
      .patch("/api/manager/trade-ins/4/decision")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ decision: "rejected", review_note: "Trade-in value too optimistic" });

    expect(response.status).toBe(200);
    expect(response.body.trade_in_status).toBe("rejected");
    expect(response.body.amount_to_add).toBe(30000);
  });
});

