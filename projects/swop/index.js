const { sumTokens, call } = require('../helper/chain/waves');
const { getConfig } = require("../helper/cache");
// const { get } = require("../helper/http");
// const { toUSDTBalances } = require("../helper/balances");


const swopfiBackendEndpoint = "https://backend.swop.fi";

const getSwopFiTVL = async (api) => {
  // const poolsStats = await get(`${swopfiBackendEndpoint}/pools`);
  // return toUSDTBalances(poolsStats.overall.liquidity);
  const { pools } = await getConfig('swop', `${swopfiBackendEndpoint}/pools`)
  // const owners = pools.map(i => i.id)
  for (const pool of pools) {
    await sumTokens({ owners: [pool.id], api, includeWaves: true, blacklistedTokens: ['Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT'] })
  }
}


module.exports = {
  timetravel: false, // Waves blockchain,
  methodology: "Counts the tokens locked on AMM pools",
  waves: {
    tvl: getSwopFiTVL,
    staking: async () => {
      // const stakingStats = await get(`${swopfiBackendEndpoint}/staking`);
      // return toUSDTBalances(stakingStats.swop.totalSwopUsdt);
      const res = await call({ target: '3PLHVWCqA9DJPDbadUofTohnCULLauiDWhS', key: 'total_GSwop_amount' })
      return { swop: res / 1e8 }
    }
  }
};
