
const { getLogs } = require('../helper/cache/getLogs')
const { request, } = require("graphql-request");
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
async function tvl({ timestamp }, ethBlock, chainBlocks) {
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
    if (Math.abs(closest.date - timestamp) > 3600 * 24) { // Oldest data is too recent
      const { uniswapFactories } = await request(
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

const defaultExport = {
  tvl: getUniTVL({ factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', useDefaultCoreAssets: true, })
}

const bscCakePool = '0x45c54210128a065de780c4b0df3d16664f7f859e'
const bscVeCake = '0x5692db8177a81a6c6afc8084c2976c9933ec1bab'

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://pancakeswap.finance/info as the source. Staking accounts for the CAKE locked in MasterChef (0x73feaa1eE314F8c655E354234017bE2193C9E24E)',
  bsc: {
    tvl
  },
  ethereum: {
    tvl: getUniTVL({ factory: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362', useDefaultCoreAssets: true, })
  },
  polygon_zkevm: defaultExport,
  linea: defaultExport,
  aptos: dexExport({
    account: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa',
    poolStr: 'swap::TokenPairReserve',
    token0Reserve: i => i.data.reserve_x,
    token1Reserve: i => i.data.reserve_y,
  }).aptos,
  era: {
    tvl: getUniTVL({ factory: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d', useDefaultCoreAssets: true, })
  },
  op_bnb: {
    tvl: getUniTVL({ factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', useDefaultCoreAssets: true, })
  },
  arbitrum: { ...defaultExport },
  base: defaultExport,
}

const config = {
  bsc: { factory: '0xfff5812c35ec100df51d5c9842e8cc3fe60f9ad7', CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', fromBlock: 14661669, pools: [bscCakePool, bscVeCake], },
  ethereum: { factory: '0x4e742608c39eafd8525b03d39121ea00ccf3c727', CAKE: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898', fromBlock: 17077652, },
  era: { factory: '0x99599dd26501fb329062d1e90cc9b9fc64c2d4c2', CAKE: '0x3A287a06c66f9E95a56327185cA2BDF5f031cEcD', fromBlock: 12527309, },
  arbitrum: { factory: '0xD621A46e8d8D077ceFfd080c6bD4Be60a1783D6c', CAKE: '0x1b896893dfc86bb67Cf57767298b9073D2c1bA2c', fromBlock: 121169985, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, CAKE, pools = [] } = config[chain]
  module.exports[chain].staking = async (api) => {
    const logs = await getLogs({ api, target: factory, eventAbi: 'event NewSmartChefContract (address indexed martChef)', onlyArgs: true, fromBlock, })
    pools.push(...logs.map(log => log.martChef))
    if (chain === 'bsc') {  // https://developer.pancakeswap.finance/contracts/syrup-pools
      const logs = await getLogs({ api, target: '0x29115Bf4863648BB01a9cEc43d8306EC51800642', eventAbi: 'event NewSmartChefContract (address indexed martChef)', onlyArgs: true, fromBlock: 48432969, })
      pools.push(...logs.map(log => log.martChef))

    }
    return api.sumTokens({ owners: pools, tokens: [CAKE] })
  }
})