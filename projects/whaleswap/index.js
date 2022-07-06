const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { stakings } = require('../helper/staking')

const graphEndpoint = 'https://api.thegraph.com/subgraphs/name/whale-swap/exchange'

const currentQuery = gql`
query whaleswapFactories {
  whaleswapFactories(first: 1) {
    totalLiquidityUSD
  }
}`;

const historicalQuery = gql`
query dayDatas {
dayDatas(
  first: 1000
  orderBy: date
  orderDirection: asc
  ) {
    date
    dailyVolumeUSD
    totalLiquidityUSD
    __typename
  }
}`;

const graphQuery = gql`
query get_tvl($block: Int) {
  whaleswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}`;

async function tvl(timestamp, ethBlock, chainBlocks) {
    if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
      const tvl = await request(graphEndpoint, currentQuery, {}, {
        "referer": "https://whaleswap.finance/",
        "origin": "https://whaleswap.finance",
      })
      return toUSDTBalances(tvl.whaleswapFactories[0].totalLiquidityUSD)
    } else {
      const tvl = (await request(graphEndpoint, historicalQuery)).pancakeDayDatas
      let closest = tvl[0]
      tvl.forEach(dayTvl => {
        if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
          closest = dayTvl
        }
      })
      if(Math.abs(closest.date - timestamp) > 3600*24){ // Oldest data is too recent
        const {whaleswapFactories} = await request(
          graphEndpoint,
          graphQuery,
          {
            block: chainBlocks['bsc'],
          }
        );
        const usdTvl = Number(whaleswapFactories[0].totalLiquidityUSD)
      
        return toUSDTBalances(usdTvl)
      }
      return toUSDTBalances(closest.totalLiquidityUSD)
    }
  }
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://analytics.whaleswap.finance/ as the source. Staking accounts for the POD locked in the PodMaster (0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D)',
    bsc: {
      staking: stakings(["0xdEe627eaaB378ec57ECfB94b389B718ef3687c0D", "0xdc8715aCFB63cd0BD01a2C3e7De514845FdbcDF7"], "0xDDed222297B3d08DAFDAc8f65eeB799B2674C78F", "bsc"),
      tvl
    },
  }