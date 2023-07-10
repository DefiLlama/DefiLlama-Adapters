const { request,  } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances')
const { stakings } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const { dexExport } = require('../helper/chain/aptos')


const graphEndpoint = 'https://proxy-worker.pancake-swap.workers.dev/bsc-exchange'
const currentQuery = `
query pancakeFactories {
  pancakeFactories(first: 1) {
    totalLiquidityUSD
  }
}
`
const historicalQuery = `
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
const graphQuery = `
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
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://pancakeswap.finance/info as the source. Staking accounts for the CAKE locked in MasterChef (0x73feaa1eE314F8c655E354234017bE2193C9E24E)',
  bsc: {
    staking: stakings(["0x73feaa1eE314F8c655E354234017bE2193C9E24E", "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652", "0x45c54210128a065de780c4b0df3d16664f7f859e", "0x556B9306565093C855AEA9AE92A594704c2Cd59e"], "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", "bsc"),
    tvl
  },
  ethereum: {
    staking: stakings(["0x556B9306565093C855AEA9AE92A594704c2Cd59e"], "0x152649ea73beab28c5b49b26eb48f7ead6d4c898", "ethereum"),
    tvl: getUniTVL({ chain: 'ethereum', factory: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362', useDefaultCoreAssets: true, })
  },
  polygon_zkevm: {
    tvl: getUniTVL({ chain: 'polygon_zkevm', factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', useDefaultCoreAssets: true, })
  },
  aptos: dexExport({
    account: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa',
    poolStr: 'swap::TokenPairReserve',
    token0Reserve: i => i.data.reserve_x,
    token1Reserve: i => i.data.reserve_y,
  }).aptos,
}
