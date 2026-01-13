const { getLogs } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

const POOL_MANAGER_ADDRESS = '0x498581fF718922c3f8e6A244956aF099B2652b2b'
const POSITION_MANAGER_ADDRESS = '0x7C5f5A4bBd8fD63184577525326123B519429bDc'
const DELI_HOOK_V2_ADDRESS = '0x95AFBC0FCcF974B41380f24e562f15b6DD90faC8' // DeliHookConstantProduct
const DELI_HOOK_V4_ADDRESS = '0x570A48F96035C2874de1c0F13c5075A05683b0cc' // DeliHook
const EARLIEST_BLOCK = 37885233

const normalizeAddr = (addr) => addr.toLowerCase()

function truncatePoolId(poolId) {
    // Truncate bytes32 poolId to bytes25 (Uniswap uses truncated poolId as key)
    return poolId.slice(0, -14)
}

async function tvl(api) {
    // STEP 1: Fetch pool IDs from DeliSwap hooks
    // V4: PoolFeeSet event
    const v4FeeLogs = await getLogs({
        api,
        target: DELI_HOOK_V4_ADDRESS,
        fromBlock: EARLIEST_BLOCK,
        eventAbi: 'event PoolFeeSet(bytes32 indexed poolId, uint24 fee)',
        onlyArgs: true,
        extraKey: 'v4-fee-set',
    })


    // V4: Query PoolManager to get currencies
    let v4Pools = []
    // Deduplicate poolIds (PoolFeeSet can be emitted multiple times per pool)
    const uniquePoolIds = [...new Set(v4FeeLogs.map(log => log.poolId))]
    const v4PoolIds = uniquePoolIds
    const truncatedPoolIds = v4PoolIds.map(truncatePoolId)

    const poolKeys = await api.multiCall({
        abi: 'function poolKeys(bytes25) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)',
        calls: truncatedPoolIds.map(id => ({ params: [id] })),
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

    throw new Error("We cant rely on modify liquidity events, it is not scalable. Need to find another way to get the liquidity.");

    // STEP 3B: Handle V4 pools - track individual positions via ModifyLiquidity events
    if (v4Pools.length > 0) {
        const v4PoolIds = v4Pools.map(pool => pool.id)
        const STATE_VIEW_ADDRESS = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'

        // Get current pool state (tick)
        const slot0Data = await api.multiCall({
            abi: 'function getSlot0(bytes32 poolId) external view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
            calls: v4PoolIds.map(id => ({ params: [id] })),
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
                topics: [modifyLiquidityTopic, poolId],
                eventAbi,
                onlyArgs: true,
                extraKey: `v4-modify-${poolId}`
            })
        )

        const modifyLogsArrays = await Promise.all(modifyLogsPromises)
        const modifyLiquidityLogs = modifyLogsArrays.flat()

        // Build position tracking: poolId -> positionKey -> {tickLower, tickUpper, liquidity}
        const positions = {}
        modifyLiquidityLogs.forEach(log => {
            const poolId = log.id.toLowerCase()
            if (!poolStateMap[poolId]) return

            if (!positions[poolId]) positions[poolId] = {}

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

        // Calculate reserves from positions (including out-of-range)
        Object.entries(positions).forEach(([poolId, poolPositions]) => {
            const poolState = poolStateMap[poolId]
            if (!poolState) return

            const currentTick = poolState.tick

            Object.entries(poolPositions).forEach(([posKey, pos]) => {
                if (pos.liquidity <= 0n) return

                // Calculate token amounts using Uniswap V3/V4 math
                // Includes out-of-range positions with their full reserves
                addUniV3LikePosition({
                    api,
                    token0: poolState.currency0,
                    token1: poolState.currency1,
                    tick: currentTick,
                    liquidity: Number(pos.liquidity),
                    tickLower: pos.tickLower,
                    tickUpper: pos.tickUpper,
                })
            })
        })
    }
}

// I have excluded v2 tvl as it overlaps with bmx amm tvl that we have already listed
module.exports = {
    methodology: `TVL is calculated from liquidity in DeliSwap pools, which are hooks on Uniswap V4 PoolManager`,
    start: 1762559813, // Nov-07-2025 11:56:53 PM +UTC
    doublecounted: true,  // same is counted as uniswap v4 tvl
    base: {
        tvl,
    }
}
