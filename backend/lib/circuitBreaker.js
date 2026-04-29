class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = Number(options.failureThreshold || 3);
    this.cooldownMs = Number(options.cooldownMs || 15000);
    this.requestTimeoutMs = Number(options.requestTimeoutMs || 4000);
    this.state = "CLOSED";
    this.failures = 0;
    this.nextTryAt = 0;
  }

  async execute(task) {
    if (this.state === "OPEN" && Date.now() < this.nextTryAt) {
      throw new Error("Circuit breaker is OPEN");
    }

    if (this.state === "OPEN" && Date.now() >= this.nextTryAt) {
      this.state = "HALF_OPEN";
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Circuit breaker timeout")), this.requestTimeoutMs);
    });

    try {
      const result = await Promise.race([task(), timeoutPromise]);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextTryAt = Date.now() + this.cooldownMs;
    }
  }

  snapshot() {
    return {
      state: this.state,
      failures: this.failures,
      nextTryAt: this.nextTryAt || null,
    };
  }
}

module.exports = {
  CircuitBreaker,
};
