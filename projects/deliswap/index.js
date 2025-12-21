const {getLogs} = require('../helper/cache/getLogs')
const {addUniV3LikePosition} = require('../helper/unwrapLPs')

const STATE_VIEW_ADDRESS = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'
const POSITION_MANAGER_ADDRESS = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const DELI_HOOK_V2_ADDRESS = '0x95AFBC0FCcF974B41380f24e562f15b6DD90faC8' // DeliHookConstantProduct
const DELI_HOOK_V4_ADDRESS = '0x570A48F96035C2874de1c0F13c5075A05683b0cc' // DeliHook
const EARLIEST_BLOCK = 37885233

function truncatePoolId(poolId) {
    // Truncate bytes32 poolId to bytes25 (Uniswap uses truncated poolId as key)
    return poolId.slice(0, -14)
}

async function tvl(api) {
    // STEP 1: Fetch pool IDs from DeliSwap hooks
    const [v2PairLogs, v4FeeLogs] = await Promise.all([
        // V2: PairCreated event
        getLogs({
            api,
            target: DELI_HOOK_V2_ADDRESS,
            fromBlock: EARLIEST_BLOCK,
            eventAbi: 'event PairCreated(bytes32 indexed poolId, address indexed currency0, address indexed currency1, uint24 fee)',
            onlyArgs: true,
            extraKey: 'v2-pairs'
        }),
        // V4: PoolFeeSet event
        getLogs({
            api,
            target: DELI_HOOK_V4_ADDRESS,
            fromBlock: EARLIEST_BLOCK,
            eventAbi: 'event PoolFeeSet(bytes32 indexed poolId, uint24 fee)',
            onlyArgs: true,
            extraKey: 'v4-fee-set'
        })
    ])

    // STEP 2: Build pool lists with currency info
    // V2: Already has currencies in the event
    const v2Pools = v2PairLogs.map(log => ({
        id: log.poolId,
        currency0: log.currency0,
        currency1: log.currency1,
        hooks: DELI_HOOK_V2_ADDRESS
    }))

    // V4: Query PoolManager to get currencies
    let v4Pools = []
    if (v4FeeLogs.length > 0) {
        const v4PoolIds = v4FeeLogs.map(log => log.poolId)
        const truncatedPoolIds = v4PoolIds.map(truncatePoolId)

        const poolKeys = await api.multiCall({
            abi: 'function poolKeys(bytes25) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)',
            calls: truncatedPoolIds.map(id => ({params: [id]})),
            target: POSITION_MANAGER_ADDRESS,
            permitFailure: true
        })

        v4Pools = v4PoolIds.map((id, i) => {
            if (!poolKeys[i]) return null
            return {
                id,
                currency0: poolKeys[i].currency0,
                currency1: poolKeys[i].currency1,
                hooks: poolKeys[i].hooks
            }
        }).filter(p => p !== null)
    }

    const deliPools = [...v2Pools, ...v4Pools]
    api.log(`Found ${deliPools.length} DeliSwap pools (V2: ${v2Pools.length}, V4: ${v4Pools.length})`)
    if (deliPools.length === 0) return {}

    // STEP 3A: Handle V2 pools
    if (v2Pools.length > 0) {
        const v2PoolIds = v2Pools.map(pool => pool.id)

        // Read reserves from DeliHookConstantProduct contract
        const v2Reserves = await api.multiCall({
            abi: 'function getReserves(bytes32 poolId) external view returns (uint128, uint128)',
            calls: v2PoolIds.map(id => ({params: [id]})),
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

    // STEP 3B: Handle V4 pools
    if (v4Pools.length > 0) {
        const v4PoolIds = v4Pools.map(pool => pool.id)

        // Read current state for all V4 pools
        const [slot0Data, liquidities] = await Promise.all([
            api.multiCall({
                abi: 'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
                calls: v4PoolIds.map(id => ({params: [id]})),
                target: STATE_VIEW_ADDRESS,
                permitFailure: true
            }),
            api.multiCall({
                abi: 'function getLiquidity(bytes32 poolId) external view returns (uint128 liquidity)',
                calls: v4PoolIds.map(id => ({params: [id]})),
                target: STATE_VIEW_ADDRESS,
                permitFailure: true
            })
        ])

        // Calculate reserves using Uniswap V3 math
        v4Pools.forEach((pool, i) => {
            if (!slot0Data[i] || !liquidities[i]) return

            const {tick} = slot0Data[i]
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
