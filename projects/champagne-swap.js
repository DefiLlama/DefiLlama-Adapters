const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('./helper/balances')

const graphEndpoint = 'https://api.thegraph.com/subgraphs/name/champagneswap/exchangev3'
const currentQuery = gql`
query champagneFactories {
  champagneFactories(first: 1) {
    totalLiquidityUSD
  }
}
`
const historicalQuery = gql`
query champagneDayDatas {
champagneDayDatas(
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

const graphUrl = 'https://api.thegraph.com/subgraphs/name/champagneswap/exchangev3'
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
      "referer": "https://champagne.finance/",
      "origin": "https://champagne.finance",
    })
    return toUSDTBalances(tvl.champagneFactories[0].totalLiquidityUSD)
  } else {
    const tvl = (await request(graphEndpoint, historicalQuery)).champagneDayDatas
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

const factory = '0xb31A337f1C3ee7fA2b2B83c6F8ee0CA643D807a0'
const champagneToken = '0x4957c1c073557BFf33C01A7cA1436D0d2409d439'
const masterChef = '0x15C17442eb2Cd3a56139e877ec7784b2dbD97270'
async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const stakedCham = sdk.api.erc20.balanceOf({
    target: champagneToken,
    owner: masterChef,
    chain: 'bsc',
    block: chainBlocks.bsc
  })

  sdk.util.sumSingleBalance(balances, 'bsc:' + champagneToken, (await stakedCham).output)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://champagne.finance/ as the source. Staking accounts for the CHAM locked in MasterChef (0x15C17442eb2Cd3a56139e877ec7784b2dbD97270)',
  bsc: {
    staking,
    tvl
  },
}
