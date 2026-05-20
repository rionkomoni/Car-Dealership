const autocannon = require("autocannon");

function parseCliArgs() {
  const args = process.argv.slice(2);
  const config = {};
  for (let i = 0; i < args.length; i += 1) {
    const k = args[i];
    const v = args[i + 1];
    if (!v) continue;
    if (k === "--url") config.url = v;
    if (k === "--duration") config.duration = Number(v);
    if (k === "--connections") config.connections = Number(v);
    if (k === "--max-latency") config.maxLatency = Number(v);
    if (k === "--min-rps") config.minRps = Number(v);
    if (k === "--paths") config.paths = v;
  }
  return config;
}

function resolveTargets(cli) {
  if (cli.url) return [cli.url];
  if (process.env.LOAD_TEST_URL && !cli.paths && !process.env.LOAD_TEST_PATHS) {
    return [process.env.LOAD_TEST_URL];
  }
  const base = (process.env.LOAD_TEST_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
  const pathList = cli.paths || process.env.LOAD_TEST_PATHS || "/health";
  return String(pathList)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("http") ? p : `${base}${p.startsWith("/") ? p : `/${p}`}`));
}

function runLoad(url, options) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        method: "GET",
        duration: Number(options.duration || process.env.LOAD_TEST_DURATION_SEC || 20),
        connections: Number(options.connections || process.env.LOAD_TEST_CONNECTIONS || 50),
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
  const cli = parseCliArgs();
  const targets = resolveTargets(cli);
  const maxAllowedLatency = Number(
    cli.maxLatency || process.env.LOAD_TEST_MAX_AVG_LATENCY_MS || 500
  );
  const minAllowedReqPerSec = Number(cli.minRps || process.env.LOAD_TEST_MIN_AVG_RPS || 20);

  let failed = false;
  for (const target of targets) {
    console.log(`\nRunning load test on ${target}`);
    const result = await runLoad(target, cli);

    const avgLatency = Number(result.latency?.average || 0);
    const avgReqPerSec = Number(result.requests?.average || 0);
    const non2xx = Number(result["non2xx"] || 0);

    console.log("Performance summary:");
    console.log(`- avg latency: ${avgLatency.toFixed(2)} ms`);
    console.log(`- avg req/sec: ${avgReqPerSec.toFixed(2)}`);
    console.log(`- non-2xx responses: ${non2xx}`);

    if (non2xx > 0 || avgLatency > maxAllowedLatency || avgReqPerSec < minAllowedReqPerSec) {
      console.error(
        `Load test failed for ${target} (latency<=${maxAllowedLatency}ms, rps>=${minAllowedReqPerSec}, non2xx=0).`
      );
      failed = true;
    }
  }

  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error("Load test failed:", err.message);
  process.exit(1);
});
