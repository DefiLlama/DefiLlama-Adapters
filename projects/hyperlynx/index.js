const { uniV3GraphExport } = require('../helper/uniswapV3')
const { getUniTVL } = require('../helper/cache/uniswap')

// Hyperlynx — Uniswap V3 + V2 fork DEX on HyperEVM (DefiLlama chain key: hyperliquid)
const CHAIN = 'hyperliquid'
const V2_FACTORY = '0x11cD396F814Bd31eBa7969c1B27a7C347785951f'
const V3_SUBGRAPH =
  'https://api.goldsky.com/api/public/project_cmg87miatabz301usdo94h2v3/subgraphs/uniswap-v3-hyperevm/prod/gn'

// V3: discover pools from the subgraph, then read pool token balances on-chain.
const v3tvl = uniV3GraphExport({ name: 'hyperlynx-v3', graphURL: V3_SUBGRAPH })

// V2: enumerate pairs from the factory and read reserves on-chain.
const v2tvl = getUniTVL({ factory: V2_FACTORY, chain: CHAIN, useDefaultCoreAssets: true })

module.exports = {
  methodology:
    'TVL is the value of tokens held in Hyperlynx Uniswap V3 and V2 liquidity pools on HyperEVM. V3 pools are listed from the project subgraph and V2 pairs from the factory; token balances are read directly on-chain.',
  start: 1781860380, // 2026-06-19, V3 factory deployment
  [CHAIN]: {
    tvl: async (api) => {
      await v3tvl(api)
      api.addBalances(await v2tvl(api))
      return api.getBalances()
    },
  },
}
