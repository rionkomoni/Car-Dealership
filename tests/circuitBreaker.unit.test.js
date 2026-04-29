const { CircuitBreaker } = require("../backend/lib/circuitBreaker");

describe("circuit breaker", () => {
  test("returns result on success and stays closed", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      cooldownMs: 100,
      requestTimeoutMs: 50,
    });

    const result = await breaker.execute(async () => "ok");

    expect(result).toBe("ok");
    expect(breaker.snapshot().state).toBe("CLOSED");
    expect(breaker.snapshot().failures).toBe(0);
  });

  test("opens circuit after threshold failures", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      cooldownMs: 1000,
      requestTimeoutMs: 50,
    });

    await expect(breaker.execute(async () => Promise.reject(new Error("boom-1")))).rejects.toThrow(
      "boom-1"
    );
    await expect(breaker.execute(async () => Promise.reject(new Error("boom-2")))).rejects.toThrow(
      "boom-2"
    );

    expect(breaker.snapshot().state).toBe("OPEN");
    await expect(breaker.execute(async () => "should-not-run")).rejects.toThrow(/OPEN/);
  });

  test("moves to half-open after cooldown and closes on success", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      cooldownMs: 30,
      requestTimeoutMs: 50,
    });

    await expect(breaker.execute(async () => Promise.reject(new Error("boom")))).rejects.toThrow(
      "boom"
    );
    expect(breaker.snapshot().state).toBe("OPEN");

    await new Promise((resolve) => setTimeout(resolve, 40));
    const value = await breaker.execute(async () => "recovered");

    expect(value).toBe("recovered");
    expect(breaker.snapshot().state).toBe("CLOSED");
    expect(breaker.snapshot().failures).toBe(0);
  });

  test("times out long request", async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      cooldownMs: 100,
      requestTimeoutMs: 20,
    });

    await expect(
      breaker.execute(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("late"), 50);
          })
      )
    ).rejects.toThrow(/timeout/i);
  });
});
