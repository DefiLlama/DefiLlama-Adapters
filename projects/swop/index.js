const { sumTokens, call } = require('../helper/chain/waves');
const { getConfig } = require("../helper/cache");
const { request, gql } = require("graphql-request");
const {toUSDTBalances} = require("../helper/balances");
// const { get } = require("../helper/http");


const swopfiBackendEndpoint = "https://backend.swop.fi";
const unit0Endpoint = "http://graphql-node-htz-fsn1-1.wvservices.com:8000/subgraphs/name/swopfi/swopfi-units"

const getSwopFiTVL = async (api) => {
  // const poolsStats = await get(`${swopfiBackendEndpoint}/pools`);
  // return toUSDTBalances(poolsStats.overall.liquidity);
  const { pools } = await getConfig('swop', `${swopfiBackendEndpoint}/pools`)
  // const owners = pools.map(i => i.id)
  for (const pool of pools) {
    await sumTokens({ owners: [pool.id], api, includeWaves: true, blacklistedTokens: ['Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT'] })
  }
}

const getSwopFiUnit0TVL = async() => {
  const graphQuery = gql`
query get_tvl($block: Int) {
  swopfiFactories(first: 1) {
    totalLiquidityUSD
  }
}
`
  const swopfiFactories = (await request(unit0Endpoint, graphQuery))['swopfiFactories']
  const usdTvl = Number(swopfiFactories[0]['totalLiquidityUSD'])
  return toUSDTBalances(usdTvl)
}


module.exports = {
  timetravel: false, // Waves blockchain,
  methodology: "Counts the tokens locked on AMM pools",
  hallmarks: [
      [1730299107, "Unit0 Protocol Lunch"]
  ],
  waves: {
    tvl: getSwopFiTVL,
    staking: async () => {
      // const stakingStats = await get(`${swopfiBackendEndpoint}/staking`);
      // return toUSDTBalances(stakingStats.swop.totalSwopUsdt);
      const res = await call({ target: '3PLHVWCqA9DJPDbadUofTohnCULLauiDWhS', key: 'total_GSwop_amount' })
      return { swop: res / 1e8 }
    }
  },
  unit0: {
    tvl: getSwopFiUnit0TVL
  }
};
