/**
 * DefiLlama treasury adapter for Circuit protocol.
 *
 * Place this file at projects/treasury/circuitdao.js in the DefiLlama/DefiLlama-Adapters repo.
 * Also add `treasury: "circuitdao.js"` to the Circuit entry in
 * defillama-server/defi/src/protocols/data5.ts.
 *
 * The protocol treasury holds BYC (Circuit's USD-pegged stablecoin). Its balance is tracked
 * on-chain and exposed via the Circuit stats API as `treasury_balance` in mBYC (1 BYC = 1000 mBYC = 1 USD).
 *
 * The values reported here can be independently verified by running the Circuit block scanner:
 * https://github.com/circuitdao/circuit-analytics
 */

const { get } = require("../helper/http");

const STATS_API = "https://api.circuitdao.com/protocol/stats";
const MCAT = 1000; // 1 BYC = 1000 mBYC = 1 USD

async function tvl(api) {
  const data = await get(STATS_API);
  if (!Array.isArray(data?.stats) || data.stats.length === 0)
    throw new Error("Circuit stats API returned empty or invalid data");

  const latest = data.stats[data.stats.length - 1];
  if (latest?.treasury_balance == null)
    throw new Error("Circuit stats API missing `treasury_balance` in latest entry");

  // BYC is pegged 1:1 to USD, so BYC amount = USD value
  api.addUSDValue(latest.treasury_balance / MCAT);
}

module.exports = {
  chia: { tvl },
};
