const { getHookPools, addUniV4PoolReserves } = require('../helper/uniswapV4')

// Helios (https://heliosliq.app): DLMM (bin) and DAMM (full range) pools on Elysium. They are Uniswap v4 pools
// carrying the Helios fee hook, so each pool's reserves are rebuilt on chain from its tick liquidity and
// current price (StateView). The tokens sit in the Uniswap v4 PoolManager, which uniswap-v4 also counts.
const POOL_MANAGER = '0xE2e105d3F7209A9DA11f83cCf3E7398a753823F1' // Uniswap v4 PoolManager on Elysium
const STATE_VIEW = '0x27eD73aE0652fdCf71d6793412A7525f32bE9dfE' // Uniswap v4 StateView on Elysium
const FROM_BLOCK = 256083 // same as the uniswap-v4 adapter, so the Initialize log cache is shared with it
const FEE_HOOKS = [
  '0xa129c69D439f30e6FfACC435a1627b7f4F9d30c4', // HeliosFeeHook
  '0x885E170Ab95421C38175d6aD43017b54AD6E30c4', // HeliosFeeHook v2
]

async function tvl(api) {
  const pools = []
  for (const hook of FEE_HOOKS)
    pools.push(...await getHookPools({ api, hook, poolManager: POOL_MANAGER, fromBlock: FROM_BLOCK }))
  await addUniV4PoolReserves({ api, pools, stateView: STATE_VIEW })
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, which the uniswap-v4 adapter counts too
  methodology: 'Counts the liquidity in Helios DLMM and DAMM pools: the Uniswap v4 pools that carry the Helios fee hook. Pools are found from the PoolManager\'s Initialize events and their reserves are rebuilt on chain from tick liquidity and the current price via StateView. The pools sit in the Uniswap v4 PoolManager, so the TVL is double counted with Uniswap v4.',
  start: '2026-11-04',
  elysium: { tvl },
}
