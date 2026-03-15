const { get } = require("../helper/http");

const STATS_API = "https://api.circuitdao.com/protocol/stats";
const MOJOS_PER_XCH = 1e12;
const MBYC_PER_BYC = 1e3;

async function tvl(api) {
  const data = await get(STATS_API);
  // stats array is oldest-first; take the most recent entry
  const latest = data.stats[data.stats.length - 1];
  const xchAmount = latest.collateral / MOJOS_PER_XCH;
  api.addCGToken("chia", xchAmount);
}

async function borrowed(api) {
  const data = await get(STATS_API);
  const latest = data.stats[data.stats.length - 1];
  // byc_in_circulation is in mBYC; BYC is a USD stablecoin pegged 1:1
  const bycAmount = latest.byc_in_circulation / MBYC_PER_BYC;
  api.add("tether", bycAmount, { skipChain: true });
}

module.exports = {
  chia: {
    tvl,
    borrowed,
  },
};
