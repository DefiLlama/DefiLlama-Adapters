const { getHookPools, addUniV4PoolReserves } = require('../helper/uniswapV4')

// Kalos V4 (https://www.kalos.fun): Kalos's Uniswap v4 pools on Kinetiq Elysium, the pools that carry Kalos's own fee
// hook. Only addresses the hook allows can create a pool with it and it registers every pool in afterInitialize, so
// every pool with one of these hooks is a Kalos pool; no pool is hardcoded. The tokens sit in the shared Uniswap v4
// PoolManager, which uniswap-v4 also counts. Contracts: https://www.kalos.fun/learn/contracts
const POOL_MANAGER = '0xE2e105d3F7209A9DA11f83cCf3E7398a753823F1' // Uniswap v4 PoolManager on Elysium
const STATE_VIEW = '0x27eD73aE0652fdCf71d6793412A7525f32bE9dfE' // Uniswap v4 StateView on Elysium
const FROM_BLOCK = 256083 // same as uniswap-v4 and heliosliq, so the Initialize log cache is shared with them
const KALOS_HOOKS = [
  '0x0559EF6bC07974bfaB2149d7fbC0E898914115CF', // KalosDynamic (Kalos V4 fee hook v2), deployed 2026-11-16 in block 6897730
  '0x0885b1C4aCDF4613C51F602B21D2bBd0876410CC', // Kalos V4 fee hook v1, deployed 2026-11-14 in block 6605271, replaced by v2
]

async function tvl(api) {
  const pools = []
  for (const hook of KALOS_HOOKS)
    pools.push(...await getHookPools({ api, hook, poolManager: POOL_MANAGER, fromBlock: FROM_BLOCK }))
  await addUniV4PoolReserves({ api, pools, stateView: STATE_VIEW })
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, which the uniswap-v4 adapter counts too
  methodology: 'Counts the liquidity in Kalos V4 pools: the Uniswap v4 pools on Elysium that carry the Kalos fee hook (KalosDynamic, and its first version). Pools are found from the PoolManager\'s Initialize events and their reserves are rebuilt on chain from tick liquidity and the current price via StateView. Uncollected fees are not counted. The pools sit in the Uniswap v4 PoolManager, so the TVL is double counted with Uniswap v4.',
  start: '2026-11-15',
  elysium: { tvl },
}
