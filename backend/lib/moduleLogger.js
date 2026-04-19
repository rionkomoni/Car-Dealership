/**
 * Logging i brendshëm për module (monitoring minimal).
 * Format: [module:Emri] [event] meta?
 */
function logModuleEvent(moduleName, event, meta) {
  const ts = new Date().toISOString();
  const suffix = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[${ts}] [module:${moduleName}] ${event}${suffix}`);
}

function logModuleError(moduleName, event, err) {
  const ts = new Date().toISOString();
  const msg = err && err.message ? err.message : String(err);
  console.error(`[${ts}] [module:${moduleName}] ERROR ${event}: ${msg}`);
}

module.exports = {
  logModuleEvent,
  logModuleError,
};
