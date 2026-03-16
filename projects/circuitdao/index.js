const { get } = require("../helper/http");

const STATS_API = "https://api.circuitdao.com/protocol/stats";
const MOJOS_PER_XCH = 1e12;
const MBYC_PER_BYC = 1e3;

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

/**
 * Borrowed: total BYC stablecoin in circulation (amount minted against XCH collateral, less amount melted).
 * `byc_in_circulation` is in mBYC (milli-BYC); BYC is pegged 1:1 to USD,
 * so it is reported as USDT to give DefiLlama a known $1 price.
 */
async function borrowed(api) {
  const data = await get(STATS_API);
  const latest = data.stats[data.stats.length - 1];
  const bycAmount = latest.byc_in_circulation / MBYC_PER_BYC;
  api.add("tether", bycAmount, { skipChain: true });
}

module.exports = {
  chia: {
    tvl,
    borrowed,
  },
};
