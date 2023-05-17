const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");


async function getLPData() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics");
  
  return {cardano:tvl.data.lp.totalLpTvl};
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl:getLPData,
  },
};