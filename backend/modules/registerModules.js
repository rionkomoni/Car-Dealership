const { logModuleEvent } = require("../lib/moduleLogger");

/**
 * Regjistron të gjitha modulet e API-së në një vend (modularizim).
 */
function registerApiModules(app) {
  const chunks = [
    ...require("./authentication"),
    ...require("./users"),
    ...require("./business"),
    ...require("./reporting"),
  ];

  for (const m of chunks) {
    app.use(m.basePath, m.router);
    logModuleEvent(m.name, "module_mount", { basePath: m.basePath });
  }
}

module.exports = { registerApiModules };
