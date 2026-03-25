const { get } = require("../helper/http");

const STATS_API = "https://api.circuitdao.com/protocol/stats";
const MOJOS_PER_XCH = 1e12;

/**
 * TVL: USD value of total XCH locked in Circuit collateral vaults.
 * `collateral` is returned in mojos (1 XCH = 1e12 mojos).
 */
async function tvl(api) {
  const data = await get(STATS_API);
  // stats array is oldest-first; take the most recent entry
  const latest = data.stats[data.stats.length - 1];
  const xchAmount = latest.collateral / MOJOS_PER_XCH;
  api.addCGToken("chia", xchAmount);
}

module.exports = {
  chia: {
    tvl,
  },
};
