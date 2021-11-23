const { request, gql } = require("graphql-request");
const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
const { staking, stakingPricedLP } = require("./helper/staking");

const graphEndpoint = 'https://api.thegraph.com/subgraphs/name/corgiswap/exchange'
const currentQuery = gql`
query pancakeFactories {
  pancakeFactories(first: 1) {
    totalTransactions
    totalVolumeUSD
    totalLiquidityUSD
    __typename
  }
}
`
const historicalQuery = gql`
query pancakeDayDatas {
pancakeDayDatas(
  first: 1000
  orderBy: date
  orderDirection: asc
  ) {
    date
    dailyVolumeUSD
    totalLiquidityUSD
    __typename
  }
}
`

async function tvl(timestamp, ethBlock, chainBlocks) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
    const tvl = await request(graphEndpoint, currentQuery)
    return toUSDTBalances(tvl.pancakeFactories[0].totalLiquidityUSD)
  } else {
    const tvl = (await request(graphEndpoint, historicalQuery)).pancakeDayDatas
    let closest = tvl[0]
    tvl.forEach(dayTvl => {
      if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
        closest = dayTvl
      }
    })
    return toUSDTBalances(closest.totalLiquidityUSD)
  }
}
const factory = "0x632F04bd6c9516246c2df373032ABb14159537cd"

const corisToken = '0x2a2cd8b1f69eb9dda5d703b3498d97080c2f194f'
const masterChef = '0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://corgiswap.info/ as the source. Staking accounts for the CORIS locked in MasterChef (0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf)',
  bsc: {
    tvl: calculateUsdUniTvl(factory, "bsc", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", [corisToken], "wbnb", 18, true),
    staking: stakingPricedLP(masterChef, corisToken, "bsc", "0x1881bd6aba086da0c5cfed7247f216dea50e38ed", "wbnb", true)
  },
}
