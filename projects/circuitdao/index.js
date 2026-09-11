const { get } = require("../helper/http");

const STATS_API = "https://api.circuitdao.com/protocol/stats";
const MOJOS_PER_XCH = 1e12;

/**
 * TVL: USD value of total XCH locked in Circuit collateral vaults.
 * `collateral` is returned in mojos (1 XCH = 1e12 mojos).
 */
async function tvl(api) {
  const data = await get(STATS_API);
  if (!Array.isArray(data?.stats) || data.stats.length === 0)
    throw new Error("CircuitDAO stats API returned empty or invalid `stats`");
  // stats array is oldest-first; take the most recent entry
  const latest = data.stats[data.stats.length - 1];
  if (latest?.collateral == null)
    throw new Error("CircuitDAO stats API missing `collateral` in latest entry");
  api.addCGToken("chia", latest.collateral / MOJOS_PER_XCH);
}

module.exports = {
  chia: {
    tvl,
  },
};
