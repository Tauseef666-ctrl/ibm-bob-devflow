const { randomUUID } = require('node:crypto');

/**
 * Finding and analysis identifiers.
 *
 * This replaces the `uuid` package, which is ESM-only from v11 onward. The
 * backend is CommonJS, so `require('uuid')` throws ERR_REQUIRE_ESM on any Node
 * older than 22.12, where require(ESM) is not available. The local test suite
 * passed on Node 26 and masked the problem, but the Vercel function bundles the
 * same CommonJS sources and failed to build.
 *
 * `crypto.randomUUID()` is built in, returns the same RFC 4122 version 4
 * string `uuid.v4()` did, and works on every Node version Vercel supports.
 * Fewer dependencies, and no ESM/CJS version hazard to keep in step across the
 * root and backend package.json files.
 */
const uuidv4 = () => randomUUID();

module.exports = { uuidv4 };
