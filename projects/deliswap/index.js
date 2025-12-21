const { getLogs } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// Contract addresses on Base
const POOL_MANAGER_ADDRESS = '0x498581fF718922c3f8e6A244956aF099B2652b2b'
const STATE_VIEW_ADDRESS = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'
const DELI_HOOK_V2_ADDRESS = '0x95AFBC0FCcF974B41380f24e562f15b6DD90faC8' // DeliHookConstantProduct
const DELI_HOOK_V4_ADDRESS = '0x570A48F96035C2874de1c0F13c5075A05683b0cc' // DeliHook
const EARLIEST_BLOCK = 37885233

const DELISWAP_HOOKS = new Set([
  DELI_HOOK_V2_ADDRESS.toLowerCase(),
  DELI_HOOK_V4_ADDRESS.toLowerCase(),
])

async function tvl(api) {
  // STEP 1: Listen to all new Uniswap pools
  const initLogs = await getLogs({
    api,
    target: POOL_MANAGER_ADDRESS,
    fromBlock: EARLIEST_BLOCK,
    eventAbi: 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)',
    onlyArgs: true,
    extraKey: 'pool-initialize'
  })

  // STEP 2: Filter to only DeliSwap pools (by hook address)
  const deliPools = initLogs.filter(log => {
    const hookAddress = log.hooks.toLowerCase()
    return DELISWAP_HOOKS.has(hookAddress)
  })
  api.log(`Found ${deliPools.length} DeliSwap pools`)
  if (deliPools.length === 0) return {}

  // STEP 3: Separate V2 and V4 pools
  const v2Pools = []
  const v4Pools = []
  deliPools.forEach(pool => {
    if (pool.hooks.toLowerCase() === DELI_HOOK_V2_ADDRESS.toLowerCase()) {
      v2Pools.push(pool)
    } else {
      v4Pools.push(pool)
    }
  })
  api.log(`V2 pools: ${v2Pools.length}, V4 pools: ${v4Pools.length}`)

  // STEP 4A: Handle V2 pools
  if (v2Pools.length > 0) {
    const v2PoolIds = v2Pools.map(pool => pool.id)
    
    // Read reserves from DeliHookConstantProduct contract
    const v2Reserves = await api.multiCall({
      abi: 'function getReserves(bytes32 poolId) external view returns (uint128, uint128)',
      calls: v2PoolIds.map(id => ({ params: [id] })),
      target: DELI_HOOK_V2_ADDRESS,
      permitFailure: true
    })

    // Add reserves to TVL
    v2Pools.forEach((pool, i) => {
      if (!v2Reserves[i]) return
      
      const [reserve0, reserve1] = v2Reserves[i]
      
      // Only add if reserves are non-zero
      if (BigInt(reserve0) > 0n) {
        api.add(pool.currency0, reserve0)
      }
      if (BigInt(reserve1) > 0n) {
        api.add(pool.currency1, reserve1)
      }
    })
  }

  // STEP 4B: Handle V4 pools
  if (v4Pools.length > 0) {
    const v4PoolIds = v4Pools.map(pool => pool.id)
    
    // Read current state for all V4 pools
    const [slot0Data, liquidities] = await Promise.all([
      api.multiCall({
        abi: 'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
        calls: v4PoolIds.map(id => ({ params: [id] })),
        target: STATE_VIEW_ADDRESS,
        permitFailure: true
      }),
      api.multiCall({
        abi: 'function getLiquidity(bytes32 poolId) external view returns (uint128 liquidity)',
        calls: v4PoolIds.map(id => ({ params: [id] })),
        target: STATE_VIEW_ADDRESS,
        permitFailure: true
      })
    ])

    // Calculate reserves using Uniswap V3 math
    v4Pools.forEach((pool, i) => {
      if (!slot0Data[i] || !liquidities[i]) return
      
      const { tick } = slot0Data[i]
      const liquidity = liquidities[i]

      if (BigInt(liquidity) === 0n) return

      // Calculate reserves from active liquidity at current tick
      addUniV3LikePosition({
        api,
        token0: pool.currency0,
        token1: pool.currency1,
        tick: Number(tick),
        liquidity: Number(liquidity),
        tickLower: -887272, // MIN_TICK
        tickUpper: 887272,  // MAX_TICK
      })
    })
  }
}

module.exports = {
  methodology: "TVL is calculated from liquidity in DeliSwap pools, which are hooks on Uniswap V4 PoolManager. V2 pools use constant product AMM with direct reserve tracking. V4 pools use concentrated liquidity with virtual reserve calculation.",
  base: {
    tvl,
    start: 1762559813, // Nov-07-2025 11:56:53 PM +UTC
  }
}

