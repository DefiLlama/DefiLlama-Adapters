const { toUSDTBalances } = require("../helper/balances");
const { fetchURL } = require("../helper/utils");

async function getStakingData() {
  const tvl = await fetchURL("https://api.vyfi.io/analytics");
  if (tvl.data.totalValueLocked <= 0) {
    throw new Error("vyfi tvl is below 0");
  }
  return toUSDTBalances(tvl.data.totalValueLocked);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  cardano: {
    tvl: () => ({}),
    staking: getStakingData,
  },
};
