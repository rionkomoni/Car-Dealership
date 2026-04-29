const apicache = require("apicache");

let redisMode = "memory";

function initRedisCache() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return;

  try {
    const { createClient } = require("redis");
    const client = createClient({ url: redisUrl });
    client.on("error", (err) => {
      console.warn(`Redis cache error, fallback memory: ${err.message}`);
      redisMode = "memory";
    });
    client
      .connect()
      .then(() => {
        apicache.options({ redisClient: client });
        redisMode = "redis";
        console.log("API cache mode: redis");
      })
      .catch((err) => {
        console.warn(`Redis cache unavailable, fallback memory: ${err.message}`);
      });
  } catch (err) {
    console.warn(`Redis package not available, fallback memory: ${err.message}`);
  }
}

initRedisCache();

const cache = apicache.middleware;

function clearApiCache() {
  apicache.clear();
}

function getCacheStatus() {
  return { mode: redisMode };
}

module.exports = { cache, clearApiCache, getCacheStatus };
