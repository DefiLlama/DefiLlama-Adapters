const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");


async function getLPData() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics");
  
  return {cardano:tvl.data.lp.totalLpTvl};
}

async function vyfiStaking() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics?filter=bar");
  
  return {cardano:tvl.data.bar.tvl};
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl:getLPData,
    staking: vyfiStaking
  },
};