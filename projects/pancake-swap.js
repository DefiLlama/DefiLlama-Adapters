const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('./helper/balances')

async function fetch() {
  let response = await utils.fetchURL('https://api.pancakeswap.finance/api/v1/stat')
  return response.data.total_value_locked_all;
}

const graphEndpoint = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2'
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

const factory = '0xBCfCcbde45cE874adCB698cC183deBcF17952812'
const cakeToken = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
const masterChef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
async function staking(timestamp, ethBlock, chainBlocks) {
  const stakedCake = sdk.api.erc20.balanceOf({
    target: cakeToken,
    owner: masterChef,
    chain: 'bsc',
    block: chainBlocks.bsc
  })

  sdk.util.sumSingleBalance(balances, 'bsc:' + cakeToken, (await stakedCake).output)
  return balances
}

module.exports = {
  staking,
  tvl
}
