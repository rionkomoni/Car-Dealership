const jwt = require("jsonwebtoken");
const requireRole = require("../backend/middleware/requireRole");

describe("requireRole middleware", () => {
  test("allows admin via ROLE_ADMIN claim", () => {
    const token = jwt.sign(
      { id: 1, email: "a@a.com", role: "admin", roles: ["ROLE_ADMIN"] },
      process.env.JWT_SECRET || "sekreti123"
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireRole(["admin"])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("denies client role", () => {
    const token = jwt.sign(
      { id: 2, email: "c@c.com", role: "client", roles: ["ROLE_CLIENT"] },
      process.env.JWT_SECRET || "sekreti123"
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    requireRole(["admin"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
