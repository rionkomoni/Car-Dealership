const { GenericContainer } = require("testcontainers");

describe("testcontainers environment (dockerized)", () => {
  jest.setTimeout(120000);

  test("starts Redis and RabbitMQ containers for integration environment", async () => {
    const redis = await new GenericContainer("redis:7-alpine").withExposedPorts(6379).start();
    const rabbit = await new GenericContainer("rabbitmq:3-management")
      .withExposedPorts(5672)
      .start();

    try {
      expect(redis.getMappedPort(6379)).toBeGreaterThan(0);
      expect(rabbit.getMappedPort(5672)).toBeGreaterThan(0);
    } finally {
      await rabbit.stop();
      await redis.stop();
    }
  });
});
