const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')

async function fetch() {
  let response = await utils.fetchURL('https://api.pancakeswap.finance/api/v1/stat')
  return response.data.total_value_locked_all;
}

const graphEndpoint = 'https://graph.mm.finance/subgraphs/name/madmeerkat-finance/exchange'
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

const graphUrl = graphEndpoint
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
      "referer": "https://mm.finance/",
      "origin": "https://mm.finance",
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

const factory = '0xd590cC180601AEcD6eeADD9B7f2B7611519544f4'
const mmfToken = '0x97749c9B61F878a880DfE312d2594AE07AEd7656'
const masterChef = '0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc'
async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const stakedMMF = sdk.api.erc20.balanceOf({
    target: mmfToken,
    owner: masterChef,
    chain: 'cronos',
    block: chainBlocks.cronos
  })

  sdk.util.sumSingleBalance(balances, 'cronos:' + mmfToken, (await stakedMMF).output)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://mm.finance as the source. Staking accounts for the MMF locked in MasterChef (0x6bE34986Fdd1A91e4634eb6b9F8017439b7b5EDc)',
  cronos: {
    staking,
    tvl
  },
}