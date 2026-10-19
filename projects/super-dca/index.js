const ADDRESSES = require('../helper/coreAssets.json')
const { getHookPools, addUniV4PoolReserves, chainConfig } = require('../helper/uniswapV4')

// Pools are Uniswap v4 pools running a Super DCA hook; they are found from the PoolManager Initialize
// logs and valued from the tick data via StateView, so no subgraph is involved (the Super DCA subgraphs
// stall with indexing errors). Every pool pairs a listed asset with the DCA token: only the listed side
// is counted, the DCA side is dropped.
const CONFIG = {
  optimism: {
    HOOKS: [
      '0xb4f4Ad63BCc0102B10e6227236e569Dce0d97A80',
      '0x7098Bf7DFF80532aa6bbDB52DF4Ac4992Bec3A80',
    ],
    WHITELISTED_TOKENS: [
      ADDRESSES.optimism.USDC_CIRCLE, // USDC
      ADDRESSES.null, // ETH
      ADDRESSES.optimism.WBTC,  // WBTC
      ADDRESSES.optimism.OP // OP
    ],
  },
  base: {
    HOOKS: [
      '0xBc5F29A583a8d3ec76e03372659e01a22feE3A80',
    ],
    WHITELISTED_TOKENS: [
      ADDRESSES.base.USDC, // USDC
      ADDRESSES.null, // ETH
      ADDRESSES.bsc.WBTC, // WBTC
      '0x63706e401c06ac8513145b7687A14804d17f814b'  // AAVE
    ],
  },
  unichain: {
    HOOKS: [
      '0x8E89b081498095669007DA306dCd7Ce7cab43A80',
    ],
    WHITELISTED_TOKENS: [
      ADDRESSES.unichain.USDC, // USDC
      ADDRESSES.null, // ETH
      ADDRESSES.bsc.WBTC, // Layer Zero Wrapped Bitcoin (WBTC)
    ],
  }
}

async function tvl(api) {
  const { HOOKS, WHITELISTED_TOKENS } = CONFIG[api.chain]
  const { poolManager, fromBlock, stateView } = chainConfig[api.chain]

  const pools = []
  for (const hook of HOOKS)
    pools.push(...await getHookPools({ api, hook, poolManager, fromBlock }))
  api.log(`${api.chain}: ${pools.length} Super DCA pools`)

  await addUniV4PoolReserves({ api, pools, stateView })

  // drop the DCA side of every pool
  const whitelist = new Set(WHITELISTED_TOKENS.map(i => i.toLowerCase()))
  const poolTokens = new Set(pools.flatMap(p => [p.token0, p.token1]).map(i => i.toLowerCase()))
  for (const token of poolTokens)
    if (!whitelist.has(token)) api.removeTokenBalance(token)
}

module.exports = {
  doublecounted: true,
  methodology: "The TVL is calculated by summing the value of tokens in Uniswap V4 liquidity pools that have the Super DCA Hook associated with them. The value represents the value of all non-DCA tokens (e.g., ETH, USDC, WBTC, AAVE, etc.) in these pools.",
  optimism: { tvl },
  base: { tvl },
  unichain: { tvl },
};
