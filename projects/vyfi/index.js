const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");

async function getStakingData() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics");
  
  return toUSDTBalances(tvl.data.totalValueLocked);
}

async function getLPData() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics");
  
  return toUSDTBalances(tvl.data.lp.totalLpTvl);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl:getLPData,
    staking: getStakingData,
  },
};
