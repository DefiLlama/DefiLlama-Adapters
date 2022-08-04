const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('./helper/balances')
const { stakings } = require('./helper/staking')


const graphEndpoint = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2'
const currentQuery = gql`
query pancakeFactories {
  pancakeFactories(first: 1) {
    totalLiquidityUSD
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

const graphUrl = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange'
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
    const tvl = await request(graphEndpoint, currentQuery, {}, {
      "referer": "https://pancakeswap.finance/",
      "origin": "https://pancakeswap.finance",
    })
    return toUSDTBalances(tvl.pancakeFactories[0].totalLiquidityUSD)
  } else {
    const tvl = (await request(graphEndpoint, historicalQuery)).pancakeDayDatas
    let closest = tvl[0]
    tvl.forEach(dayTvl => {
      if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
        closest = dayTvl
      }
    })
    if(Math.abs(closest.date - timestamp) > 3600*24){ // Oldest data is too recent
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
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://pancakeswap.info/ as the source. Staking accounts for the CAKE locked in MasterChef (0x73feaa1eE314F8c655E354234017bE2193C9E24E)',
  bsc: {
    staking: stakings(["0x73feaa1eE314F8c655E354234017bE2193C9E24E", "0x45c54210128a065de780c4b0df3d16664f7f859e"], "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", "bsc"),
    tvl
  },
}
