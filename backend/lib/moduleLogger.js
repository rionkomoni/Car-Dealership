const fs = require("fs");
const path = require("path");

const logFilePath =
  process.env.LOG_FILE_PATH || path.join(__dirname, "..", "logs", "application.log");

function writeLogLine(level, line) {
  try {
    const dir = path.dirname(logFilePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(logFilePath, `${line}\n`, "utf8");
  } catch (err) {
    // Keep logging resilient; app should not crash due to file I/O.
    const fallback = `[${new Date().toISOString()}] [module:logger] ERROR file_write_failed: ${
      err.message
    }`;
    if (level === "error") {
      console.error(fallback);
    } else {
      console.log(fallback);
    }
  }
}

function logModuleEvent(moduleName, event, meta) {
  const ts = new Date().toISOString();
  const suffix = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${ts}] [module:${moduleName}] ${event}${suffix}`;
  console.log(line);
  writeLogLine("info", line);
}

function logModuleError(moduleName, event, err) {
  const ts = new Date().toISOString();
  const msg = err && err.message ? err.message : String(err);
  const line = `[${ts}] [module:${moduleName}] ERROR ${event}: ${msg}`;
  console.error(line);
  writeLogLine("error", line);
}

module.exports = {
  logModuleEvent,
  logModuleError,
};
