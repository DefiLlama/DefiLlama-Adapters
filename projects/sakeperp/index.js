const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('./helper/balances')

const graphEndpoint = 'https://api.thegraph.com/subgraphs/name/therealsakeswap/sakeswap-subgraph-v2'
const currentQuery = gql`
query uniswapFactories {
  uniswapFactories(first: 1) {
    totalTransactions
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`
const historicalQuery = gql`
query sakeDayDatas {
uniswapFactories(
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

const graphUrl = 'https://api.thegraph.com/subgraphs/name/therealsakeswap/sakeswap-subgraph-v2'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactories(
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;
async function tvl(timestamp, ethBlock, chainBlocks) {
  if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
    const tvl = await request(graphEndpoint, currentQuery)
    return toUSDTBalances(tvl.uniswapFactories[0].totalLiquidityUSD)
  } else {
    const tvl = (await request(graphEndpoint, historicalQuery)).sakeDayDatas
    let closest = tvl[0]
    tvl.forEach(dayTvl => {
      if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
        closest = dayTvl
      }
    })
    if(Math.abs(dayTvl.date - timestamp) > 3600*24){
      const {uniswapFactories} = await request(
        graphUrl,
        graphQuery,
        {
          block: chainBlocks['bsc'],
        }
      );
      const usdTvl = Number(uniswapFactories[0].totalLiquidityUSD)
    
      return toUSDTBalances(usdTvl)
    }
    return toUSDTBalances(closest.totalLiquidityUSD)
  }
}

module.exports = {
  tvl
}