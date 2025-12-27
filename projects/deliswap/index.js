const {getLogs} = require('../helper/cache/getLogs')
const fs = require('fs')
const path = require('path')

// Debug logging to file
const logFile = path.join(__dirname, 'debug.log')
const debugLog = (msg) => {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`)
    console.log(msg)
}

const POOL_MANAGER_ADDRESS = '0x498581fF718922c3f8e6A244956aF099B2652b2b'
const POSITION_MANAGER_ADDRESS = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const DELI_HOOK_V2_ADDRESS = '0x95AFBC0FCcF974B41380f24e562f15b6DD90faC8' // DeliHookConstantProduct
const DELI_HOOK_V4_ADDRESS = '0x570A48F96035C2874de1c0F13c5075A05683b0cc' // DeliHook
const EARLIEST_BLOCK = 37885233
const Q96 = 2n ** 96n
const MAX_TICK = 887272

const sqrtRatioCache = new Map()
const normalizeAddr = (addr) => addr.toLowerCase()

function getSqrtRatioAtTick(tick) {
    const absTick = Math.abs(tick)
    if (absTick > MAX_TICK) throw new Error(`Tick ${tick} out of bounds (max ±${MAX_TICK})`)

    // Port of Uniswap V3 TickMath.getSqrtRatioAtTick
    let ratio = (absTick & 0x1) !== 0 ? 0xfffcb933bd6fad37aa2d162d1a594001n : 0x100000000000000000000000000000000n

    if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n
    if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n
    if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n
    if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n
    if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n
    if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n
    if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n
    if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n
    if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n
    if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n
    if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n
    if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n
    if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n
    if (absTick & 0x4000) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n
    if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n
    if (absTick & 0x10000) ratio = (ratio * 0x09aa508b5b7a84e1c677de54f3e99bc9n) >> 128n
    if (absTick & 0x20000) ratio = (ratio * 0x05d6af8dedb81196699c329225ee604n) >> 128n
    if (absTick & 0x40000) ratio = (ratio * 0x02216e584f5fa1ea926041bedfe98n) >> 128n
    if (absTick & 0x80000) ratio = (ratio * 0x0048a170391f7dc42444e8fa2n) >> 128n

    if (tick > 0) ratio = ((1n << 256n) - 1n) / ratio

    let sqrtPriceX96 = ratio >> 32n
    if (ratio % (1n << 32n) > 0n) sqrtPriceX96 += 1n
    return sqrtPriceX96
}

function getSqrtRatioAtTickCached(tick) {
    if (sqrtRatioCache.has(tick)) return sqrtRatioCache.get(tick)
    const v = getSqrtRatioAtTick(tick)
    sqrtRatioCache.set(tick, v)
    return v
}

function toBigInt(v) {
    if (v === null || v === undefined) return null
    if (typeof v === 'bigint') return v
    if (typeof v === 'number') return BigInt(v)
    if (typeof v === 'string') return BigInt(v)
    if (typeof v.toString === 'function') return BigInt(v.toString())
    return BigInt(v)
}

function getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
    let a = sqrtRatioAX96
    let b = sqrtRatioBX96
    if (a > b) [a, b] = [b, a]

    const numerator = liquidity * Q96 * (b - a)
    const denominator = b * a
    if (denominator === 0n) return 0n
    return numerator / denominator
}

function getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
    let a = sqrtRatioAX96
    let b = sqrtRatioBX96
    if (a > b) [a, b] = [b, a]
    return (liquidity * (b - a)) / Q96
}

function addV4PositionActiveOnly({api, token0, token1, sqrtPriceX96, tick, tickLower, tickUpper, liquidity}) {
    if (liquidity <= 0n) return
    if (sqrtPriceX96 === 0n) return
    if (tick < tickLower || tick >= tickUpper) return

    const sqrtRatioAX96 = getSqrtRatioAtTickCached(tickLower)
    const sqrtRatioBX96 = getSqrtRatioAtTickCached(tickUpper)

    const amount0 = getAmount0ForLiquidity(sqrtPriceX96, sqrtRatioBX96, liquidity)
    const amount1 = getAmount1ForLiquidity(sqrtRatioAX96, sqrtPriceX96, liquidity)

    if (amount0 > 0n) api.add(token0, amount0)
    if (amount1 > 0n) api.add(token1, amount1)
}

function truncatePoolId(poolId) {
    // Truncate bytes32 poolId to bytes25 (Uniswap uses truncated poolId as key)
    return poolId.slice(0, -14)
}

async function tvl(api) {
    // Clear debug log
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile)
    debugLog('=== DeliSwap TVL Calculation Started ===')

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
            extraKey: 'v4-fee-set',
            skipCache: true // Force fresh fetch to avoid stale cache
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
        // Deduplicate poolIds (PoolFeeSet can be emitted multiple times per pool)
        const uniquePoolIds = [...new Set(v4FeeLogs.map(log => log.poolId))]
        debugLog(`V4 PoolFeeSet events: ${v4FeeLogs.length}, unique pools: ${uniquePoolIds.length}`)

        const v4PoolIds = uniquePoolIds
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

    debugLog(`Raw events - V2 PairCreated: ${v2PairLogs.length}, V4 PoolFeeSet: ${v4FeeLogs.length}`)
    debugLog(`Processed - V2 pools: ${v2Pools.length}, V4 pools: ${v4Pools.length}`)

    const deliPools = [...v2Pools, ...v4Pools]
    debugLog(`Found ${deliPools.length} DeliSwap pools (V2: ${v2Pools.length}, V4: ${v4Pools.length})`)
    if (deliPools.length === 0) {
        debugLog('No DeliSwap pools found, exiting')
        return {}
    }

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
                debugLog(`V2 Pool ${pool.id} (${pool.currency0}): ${reserve0}`)
            }
            if (BigInt(reserve1) > 0n) {
                api.add(pool.currency1, reserve1)
                debugLog(`V2 Pool ${pool.id} (${pool.currency1}): ${reserve1}`)
            }
        })
    }

    // STEP 3B: Handle V4 pools - track individual positions via ModifyLiquidity events
    // Note: Cannot use balanceOf on PoolManager as it holds tokens for ALL V4 protocols
    if (v4Pools.length > 0) {
        const v4PoolIds = v4Pools.map(pool => pool.id)
        const STATE_VIEW_ADDRESS = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'

        // Get current pool state (tick and sqrtPrice)
        const slot0Data = await api.multiCall({
            abi: 'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
            calls: v4PoolIds.map(id => ({params: [id]})),
            target: STATE_VIEW_ADDRESS,
            permitFailure: true
        })

        // Build pool state map
        const poolStateMap = {}
        v4Pools.forEach((pool, i) => {
            if (slot0Data[i]) {
                poolStateMap[pool.id.toLowerCase()] = {
                    ...pool,
                    tick: Number(slot0Data[i].tick),
                    sqrtPriceX96: toBigInt(slot0Data[i].sqrtPriceX96) ?? 0n,
                }
            }
        })

        // Fetch ModifyLiquidity events for each V4 pool separately (filtered by poolId topic)
        const eventAbi = 'event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)'
        const modifyLiquidityTopic = '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec'

        const modifyLogsPromises = v4PoolIds.map((poolId, idx) =>
            getLogs({
                api,
                target: POOL_MANAGER_ADDRESS,
                fromBlock: EARLIEST_BLOCK,
                topics: [modifyLiquidityTopic, poolId], // Event signature + specific poolId filter
                eventAbi,
                onlyArgs: true,
                // CRITICAL: getLogs cache key does NOT include topics; must include poolId to avoid cross-pool cache pollution
                extraKey: `v4-modify-${poolId}` // Stable per-pool cache key
            })
        )

        const modifyLogsArrays = await Promise.all(modifyLogsPromises)
        const modifyLiquidityLogs = modifyLogsArrays.flat()

        debugLog(`Found ${modifyLiquidityLogs.length} ModifyLiquidity events for ${v4Pools.length} V4 pools`)
        debugLog(`ModifyLogs per pool: ${modifyLogsArrays.map((arr, i) => `Pool ${i}: ${arr.length}`).join(', ')}`)

        // Build position tracking: poolId -> positionKey -> {tickLower, tickUpper, liquidity}
        const positions = {}
        modifyLiquidityLogs.forEach(log => {
            const poolId = log.id.toLowerCase()
            if (!poolStateMap[poolId]) return

            if (!positions[poolId]) positions[poolId] = {}

            // Build position key matching exporter logic
            let posKey
            if (normalizeAddr(log.sender) === normalizeAddr(POSITION_MANAGER_ADDRESS)) {
                // NFT position: salt IS the tokenId
                const tokenId = BigInt(log.salt).toString()
                posKey = `nft-${tokenId}`
            } else {
                // Non-NFT position: use sender-tickLower-tickUpper-salt
                posKey = `${normalizeAddr(log.sender)}-${log.tickLower}-${log.tickUpper}-${log.salt}`
            }

            if (!positions[poolId][posKey]) {
                positions[poolId][posKey] = {
                    tickLower: Number(log.tickLower),
                    tickUpper: Number(log.tickUpper),
                    liquidity: 0n
                }
            }

            // Accumulate liquidity (can be negative for burns)
            positions[poolId][posKey].liquidity += BigInt(log.liquidityDelta)
        })

        // Calculate reserves from positions
        let totalPositions = 0
        let activePositions = 0
        let zeroLiqPositions = 0
        let outOfRangePositions = 0

        Object.entries(positions).forEach(([poolId, poolPositions]) => {
            const poolState = poolStateMap[poolId]
            if (!poolState) return

            const currentTick = poolState.tick

            Object.entries(poolPositions).forEach(([posKey, pos]) => {
                totalPositions++

                if (pos.liquidity <= 0n) {
                    zeroLiqPositions++
                    return
                }

                // TODO: Currently only counting active positions for debug comparison vs backend, switch to all later
                if (currentTick < pos.tickLower || currentTick >= pos.tickUpper) {
                    outOfRangePositions++
                    return // Skip out-of-range positions for now
                }

                activePositions++

                // Calculate token amounts using exact (BigInt) Uniswap V3/V4 math (active-only)
                addV4PositionActiveOnly({
                    api,
                    token0: poolState.currency0,
                    token1: poolState.currency1,
                    sqrtPriceX96: poolState.sqrtPriceX96,
                    tick: currentTick,
                    liquidity: pos.liquidity,
                    tickLower: pos.tickLower,
                    tickUpper: pos.tickUpper,
                })

                debugLog(`V4 Pool ${poolId} Pos ${posKey} (${pos.liquidity.toString()} liq): Added to TVL`)
            })
        })

        debugLog(`V4 Positions: ${totalPositions} total, ${activePositions} active, ${outOfRangePositions} out-of-range, ${zeroLiqPositions} zero-liquidity`)
    }

    debugLog('=== DeliSwap TVL Calculation Completed ===')
}

module.exports = {
    methodology: "TVL is calculated from liquidity in DeliSwap pools, which are hooks on Uniswap V4 PoolManager. V2 pools use constant product AMM with direct reserve tracking. V4 pools use concentrated liquidity with virtual reserve calculation.",
    base: {
        tvl,
        start: 1762559813, // Nov-07-2025 11:56:53 PM +UTC
    }
}
