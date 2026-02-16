const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

// V1 vault (legacy, Uniswap V3 only — users can still withdraw)
const V1_VAULT = '0x43Ca8D329d91ADF0aa471aC7587Aac1B2743F043'

// V2 vault proxy (multi-DEX: Uniswap V3, Aerodrome, PancakeSwap on Base)
const V2_VAULT = '0xd3923beccb6e1ddb048ed00a0a9bd602d16b7470'

// ABI for vault's UserPosition struct (16 fields)
const vaultPositionAbi = 'function positions(uint256) view returns (uint256 tokenId, bytes32 poolId, address owner, uint16 rangeWidthBps, int24 currentTickLower, int24 currentTickUpper, bool autoSnuggleEnabled, bool autoCompoundEnabled, uint32 rebalanceDelay, uint256 outOfRangeSince, uint256 totalRebalances, uint256 lastRebalanceTime, uint256 depositTimestamp, uint256 cumulativeFees0, uint256 cumulativeFees1, uint256 cumulativeRewards)'

// ABI for vault's PoolConfig struct (8 fields)
const poolConfigAbi = 'function approvedPools(bytes32) view returns (address pool, address token0, address token1, uint24 fee, int24 tickSpacing, bool active, address positionAdapter, address rewardAdapter)'

// Works for Uni V3, Aerodrome CL, and PancakeSwap V3 — tickLower/tickUpper/liquidity at same indices
const nftPositionAbi = 'function positions(uint256) view returns (uint96, address, address, address, uint24, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256, uint256, uint128, uint128)'

// Minimal slot0 ABI — first two returns (sqrtPriceX96, tick) are identical across all V3 DEXes
const slot0Abi = 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick)'

async function tvl(api) {
  // --- V1 vault: Uniswap V3 positions only (legacy, may have burned positions) ---
  try {
    await sumTokens2({ api, owners: [V1_VAULT], resolveUniV3: true, permitFailure: true })
  } catch (_) { }

  // --- V2 vault: enumerate all positions across Uniswap V3, Aerodrome, PancakeSwap ---
  const totalPositions = await api.call({ target: V2_VAULT, abi: 'uint256:totalActivePositions' })
  if (totalPositions == 0) return

  // Get all position token IDs from the vault
  const indices = Array.from({ length: Number(totalPositions) }, (_, i) => i)
  const tokenIds = await api.multiCall({
    target: V2_VAULT,
    abi: 'function allPositionIds(uint256) view returns (uint256)',
    calls: indices,
  })

  // Get poolId for each position
  const positionsData = await api.multiCall({
    target: V2_VAULT,
    abi: vaultPositionAbi,
    calls: tokenIds,
  })

  // Get config for each unique pool (pool address, tokens, adapter)
  const uniquePoolIds = [...new Set(positionsData.map(p => p.poolId))]
  const poolConfigs = await api.multiCall({
    target: V2_VAULT,
    abi: poolConfigAbi,
    calls: uniquePoolIds,
  })
  const poolMap = Object.fromEntries(uniquePoolIds.map((id, i) => [id, poolConfigs[i]]))

  // Read NFT position manager from each unique adapter (dynamic, no hardcoded addresses)
  const uniqueAdapters = [...new Set(poolConfigs.map(c => c.positionAdapter))]
  const nftManagers = await api.multiCall({
    abi: 'address:nftPositionManager',
    calls: uniqueAdapters,
  })
  const adapterToNft = Object.fromEntries(uniqueAdapters.map((a, i) => [a.toLowerCase(), nftManagers[i]]))

  // Group positions by their NFT position manager
  const groups = {} // nftManager → [{ tokenId, pool, token0, token1 }]
  tokenIds.forEach((tokenId, i) => {
    const config = poolMap[positionsData[i].poolId]
    const nft = adapterToNft[config.positionAdapter.toLowerCase()]
    if (!nft) return // skip if adapter doesn't expose nftPositionManager (shouldn't happen in practice)
    if (!groups[nft]) groups[nft] = []
    groups[nft].push({ tokenId, pool: config.pool, token0: config.token0, token1: config.token1 })
  })

  // For each NFT manager: fetch position liquidity/ticks and compute token amounts
  for (const [nftManager, positions] of Object.entries(groups)) {
    // Get liquidity and tick range from the NFT position manager
    const nftData = await api.multiCall({
      target: nftManager,
      abi: nftPositionAbi,
      calls: positions.map(p => p.tokenId),
    })

    // Get current tick for each unique pool
    const uniquePools = [...new Set(positions.map(p => p.pool))]
    const slot0s = await api.multiCall({
      abi: slot0Abi,
      calls: uniquePools,
    })
    const tickMap = Object.fromEntries(uniquePools.map((pool, i) => [pool, Number(slot0s[i].tick)]))

    // Compute token amounts using standard V3 liquidity math
    positions.forEach((pos, i) => {
      const { liquidity, tickLower, tickUpper } = nftData[i]
      if (liquidity == 0) return
      addUniV3LikePosition({
        api,
        token0: pos.token0,
        token1: pos.token1,
        tick: tickMap[pos.pool],
        liquidity,
        tickLower: Number(tickLower),
        tickUpper: Number(tickUpper),
      })
    })
  }
}

module.exports = {
  methodology: 'TVL is calculated by summing the value of all concentrated liquidity positions managed by the Snuggle vault across Uniswap V3, Aerodrome, and PancakeSwap on Base.',
  start: 1704067200,
  doublecounted: true,
  base: {
    tvl,
  },
}
