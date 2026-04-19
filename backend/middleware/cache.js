const apicache = require("apicache");

const cache = apicache.middleware;

function clearApiCache() {
  apicache.clear();
}

module.exports = { cache, clearApiCache };
