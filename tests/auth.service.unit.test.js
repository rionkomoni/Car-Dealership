jest.mock("../backend/repositories/userRepository");
jest.mock("../backend/repositories/authTokenRepository");
jest.mock("../backend/services/auditService", () => ({
  saveAuditLog: jest.fn().mockResolvedValue(undefined),
}));

const userRepository = require("../backend/repositories/userRepository");
const authTokenRepository = require("../backend/repositories/authTokenRepository");
const authService = require("../backend/services/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("toRoleClaim maps roles to ROLE_*", () => {
    expect(authService.toRoleClaim("admin")).toBe("ROLE_ADMIN");
    expect(authService.toRoleClaim("ROLE_MANAGER")).toBe("ROLE_MANAGER");
    expect(authService.toRoleClaim("")).toBe("ROLE_USER");
  });

  test("getAccessTokenTtl returns at least 60 seconds", () => {
    expect(authService.getAccessTokenTtl()).toBeGreaterThanOrEqual(60);
  });

  test("registerUser rejects duplicate email", async () => {
    userRepository.findUserByEmail.mockResolvedValue({ id: 1, email: "a@test.com" });
    await expect(
      authService.registerUser({ name: "A", email: "a@test.com", password: "secret" })
    ).rejects.toMatchObject({ status: 400, message: "Ky email ekziston" });
  });

  test("registerUser creates inactive client", async () => {
    userRepository.findUserByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue({ id: 2, email: "new@test.com", role: "client" });
    const result = await authService.registerUser({
      name: "New",
      email: "new@test.com",
      password: "secret",
    });
    expect(result.message).toMatch(/sukses/i);
    expect(userRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@test.com", role: "client" })
    );
  });

  test("loginUser rejects missing user", async () => {
    userRepository.findUserByEmail.mockResolvedValue(null);
    await expect(
      authService.loginUser({ email: "missing@test.com", password: "x" }, {})
    ).rejects.toMatchObject({ status: 400, message: "Përdoruesi nuk u gjet" });
  });

  test("loginUser returns tokens on success", async () => {
    const hashed = require("bcryptjs").hashSync("good", 10);
    userRepository.findUserByEmail.mockResolvedValue({
      id: 5,
      name: "User",
      email: "u@test.com",
      password: hashed,
      role: "client",
    });
    authTokenRepository.insertRefreshToken.mockResolvedValue(1);

    const result = await authService.loginUser(
      { email: "u@test.com", password: "good" },
      { ip: "127.0.0.1" }
    );

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe("u@test.com");
    expect(result.tokenType).toBe("Bearer");
  });

  test("loginUser rejects invalid password", async () => {
    const hashed = require("bcryptjs").hashSync("good", 10);
    userRepository.findUserByEmail.mockResolvedValue({
      id: 5,
      email: "u@test.com",
      password: hashed,
      role: "client",
    });

    await expect(
      authService.loginUser({ email: "u@test.com", password: "bad" }, {})
    ).rejects.toMatchObject({ status: 400, message: "Password i gabuar" });
  });

  test("refreshSession rejects unknown token", async () => {
    authTokenRepository.findRefreshTokenByHash.mockResolvedValue(null);
    await expect(authService.refreshSession("unknown-token", {})).rejects.toMatchObject({
      status: 401,
    });
  });

  test("refreshSession rotates token on success", async () => {
    authTokenRepository.findRefreshTokenByHash.mockResolvedValue({
      id: 10,
      user_id: 5,
      expires_at: new Date(Date.now() + 60_000),
      revoked_at: null,
    });
    userRepository.findUserById.mockResolvedValue({
      id: 5,
      name: "User",
      email: "u@test.com",
      role: "admin",
    });
    authTokenRepository.insertRefreshToken.mockResolvedValue(11);
    authTokenRepository.revokeRefreshToken.mockResolvedValue(true);

    const result = await authService.refreshSession("valid-refresh-token-value-here", {});
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(authTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(10, 11);
  });

  test("logoutUser revokes refresh token", async () => {
    authTokenRepository.revokeRefreshTokenByHash.mockResolvedValue(1);
    const result = await authService.logoutUser("valid-refresh-token-value-here", {});
    expect(result.success).toBe(true);
  });
});
