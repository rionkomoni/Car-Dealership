const autocannon = require("autocannon");

function runLoad(url) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        method: "GET",
        duration: Number(process.env.LOAD_TEST_DURATION_SEC || 20),
        connections: Number(process.env.LOAD_TEST_CONNECTIONS || 50),
        pipelining: 1,
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

async function main() {
  // Use non-rate-limited health endpoint by default so performance checks
  // measure server capacity, not intentional API throttling behavior.
  const target = process.env.LOAD_TEST_URL || "http://localhost:5000/health";
  console.log(`Running load test on ${target}`);
  const result = await runLoad(target);

  const avgLatency = Number(result.latency?.average || 0);
  const avgReqPerSec = Number(result.requests?.average || 0);
  const non2xx = Number(result["non2xx"] || 0);

  console.log("\nPerformance summary:");
  console.log(`- avg latency: ${avgLatency.toFixed(2)} ms`);
  console.log(`- avg req/sec: ${avgReqPerSec.toFixed(2)}`);
  console.log(`- non-2xx responses: ${non2xx}`);

  const maxAllowedLatency = Number(process.env.LOAD_TEST_MAX_AVG_LATENCY_MS || 500);
  const minAllowedReqPerSec = Number(process.env.LOAD_TEST_MIN_AVG_RPS || 20);

  if (non2xx > 0 || avgLatency > maxAllowedLatency || avgReqPerSec < minAllowedReqPerSec) {
    console.error(
      `Load test failed thresholds (latency<=${maxAllowedLatency}ms, rps>=${minAllowedReqPerSec}, non2xx=0).`
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Load test failed:", err.message);
  process.exit(1);
});
