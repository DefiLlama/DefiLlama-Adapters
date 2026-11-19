const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV4PoolReserves } = require('../helper/uniswapV4')

// Nest AVR pools on Elysium are Uniswap v4 pools, each with its own hook deployed by the Nest AVR factory.
// The tokens sit in the Uniswap v4 PoolManager, so each pool's reserves are rebuilt on chain from its tick
// liquidity and current price (StateView).
const POOL_MANAGER = '0xE2e105d3F7209A9DA11f83cCf3E7398a753823F1' // Uniswap v4 PoolManager on Elysium
const STATE_VIEW = '0x27eD73aE0652fdCf71d6793412A7525f32bE9dfE' // Uniswap v4 StateView on Elysium
const POOL_MANAGER_FROM_BLOCK = 256083 // same as the uniswap-v4 adapter, so the Initialize log cache is shared with it
const AVR_FACTORY = '0x24c1e5076230a496083a23d7c00482d982a06171'
const AVR_FACTORY_FROM_BLOCK = 1501298
// emitted by the factory for every pool it deploys: (address indexed hook, bytes32 indexed poolId, ...)
const POOL_DEPLOYED_TOPIC = '0x38e2693f0bd70571420a5caefce8dac22025da8b5d27448280c9c5e557ee3923'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'

async function tvl(api) {
  const deployLogs = await getLogs2({ api, target: AVR_FACTORY, topics: [POOL_DEPLOYED_TOPIC], fromBlock: AVR_FACTORY_FROM_BLOCK })
  const poolIds = new Set(deployLogs.map((log) => log.topics[2].toLowerCase()))

  const initLogs = await getLogs2({ api, factory: POOL_MANAGER, eventAbi: initializeAbi, fromBlock: POOL_MANAGER_FROM_BLOCK })
  const pools = initLogs
    .filter((log) => poolIds.has(log.id.toLowerCase()))
    .map((log) => ({ id: log.id, token0: log.currency0, token1: log.currency1, spacing: Number(log.tickSpacing) }))

  await addUniV4PoolReserves({ api, pools, stateView: STATE_VIEW })
}

module.exports = {
  doublecounted: true, // the pools live in the Uniswap v4 PoolManager, which the uniswap-v4 adapter counts too
  methodology: 'Counts the liquidity in Nest AVR pools: the Uniswap v4 pools deployed through the Nest AVR factory, each with its own hook. Pools are found from the factory\'s deployment events and their reserves are rebuilt on chain from tick liquidity and the current price via StateView. The pools sit in the Uniswap v4 PoolManager, so the TVL is double counted with Uniswap v4.',
  elysium: { tvl },
}
