const {getLogs} = require('../helper/cache/getLogs')
const {addUniV3LikePosition} = require('../helper/unwrapLPs')
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

// Helper to normalize address to lowercase for comparison
const normalizeAddr = (addr) => addr.toLowerCase()

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
                    tick: Number(slot0Data[i].tick)
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
                extraKey: `v4-modify-${idx}` // Unique key per pool
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

                // Calculate actual token amounts using Uniswap V3 math
                addUniV3LikePosition({
                    api,
                    token0: poolState.currency0,
                    token1: poolState.currency1,
                    tick: currentTick,
                    liquidity: Number(pos.liquidity),
                    tickLower: pos.tickLower,
                    tickUpper: pos.tickUpper,
                })
                
                debugLog(`V4 Pool ${poolId} Pos ${posKey} (${Number(pos.liquidity)} liq): Added to TVL`)
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
