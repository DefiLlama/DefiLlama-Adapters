const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('./helper/balances')

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

const corisToken = '0x2a2cd8b1f69eb9dda5d703b3498d97080c2f194f'
const masterChef = '0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf'
async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const stakedCoris = await sdk.api.erc20.balanceOf({
    target: corisToken,
    owner: masterChef,
    chain: 'bsc',
    block: chainBlocks.bsc
  })

  sdk.util.sumSingleBalance(balances, 'bsc:' + corisToken, stakedCoris.output)
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://corgiswap.info/ as the source. Staking accounts for the CORIS locked in MasterChef (0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf)',
  staking: {
    tvl: staking
  },
  tvl
}
