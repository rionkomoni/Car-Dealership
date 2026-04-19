const jwt = require("jsonwebtoken");
const auth = require("../backend/middleware/auth");

describe("auth middleware", () => {
  test("returns 401 when authorization header is missing", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when token is valid", () => {
    const token = jwt.sign(
      { id: 1, email: "test@test.com", role: "admin" },
      process.env.JWT_SECRET || "sekreti123"
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe("test@test.com");
  });
});
