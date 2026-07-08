// The `reflect` folder hosts two independent Reflect dashboards with different on-chain
// account schemas, tracked as separate adapters:
//   - ./v2.js — Reflect V2 (current deployment)
//   - ./v1.js — Reflect V1 (original deployment; discontinued after the 2026-04-01 Drift exploit)
// The folder's default adapter is the current version (V2). V1 is listed separately from ./v1.js
// (it also carries a `deadFrom` and historical-backfill logic that should not merge into V2).
module.exports = require("./v2.js");
