const { getLogs } = require('../helper/cache/getLogs')

const CL_CORE = '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F'
const FROM_BLOCK = 42111754
const DETAILS_CHUNK_SIZE = 50
const DETAILS_CHUNK_CONCURRENCY = 5

const abi = {
  getPositionDetails: 'function getPositionDetails(bytes32 key) view returns ((bytes32 key, address owner, uint256 tokenId, address pool, address token0, address token1, uint24 fee, int24 tickSpacing, int24 tickLower, int24 tickUpper, int24 currentTick, uint128 liquidity, uint128 tokensOwed0, uint128 tokensOwed1, uint256 pendingFees0, uint256 pendingFees1, uint256 pendingFeesUSDC, uint256 amount0Now, uint256 amount1Now, uint256 valueUSDCNow, uint256 dustUSDC, uint256 totalDepositedUSDC, uint256 openedAt, address dex, bool botAllowed) d)',
}

const events = {
  positionRegistered: 'event PositionRegistered(address indexed owner, bytes32 indexed key, uint256 tokenId)',
  positionRemoved: 'event PositionRemoved(address indexed owner, bytes32 indexed key, uint256 tokenId)',
}

function chunkArray(items, size) {
  const out = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function tvl(api) {
  const [registerLogs, removeLogs] = await Promise.all([
    getLogs({
      api,
      target: CL_CORE,
      fromBlock: FROM_BLOCK,
      eventAbi: events.positionRegistered,
      onlyArgs: true,
      extraKey: 'positionRegistered',
    }),
    getLogs({
      api,
      target: CL_CORE,
      fromBlock: FROM_BLOCK,
      eventAbi: events.positionRemoved,
      onlyArgs: true,
      extraKey: 'positionRemoved',
    }),
  ])

  const keyCounts = new Map()

  registerLogs.forEach(({ key }) => {
    if (!key) return
    const normalizedKey = String(key).toLowerCase()
    keyCounts.set(normalizedKey, (keyCounts.get(normalizedKey) ?? 0) + 1)
  })

  removeLogs.forEach(({ key }) => {
    if (!key) return
    const normalizedKey = String(key).toLowerCase()
    keyCounts.set(normalizedKey, (keyCounts.get(normalizedKey) ?? 0) - 1)
  })

  const activeKeys = [...keyCounts.entries()]
    .filter(([, count]) => count > 0)
    .map(([key]) => key)

  if (!activeKeys.length) return

  const chunks = chunkArray(activeKeys, DETAILS_CHUNK_SIZE)

  for (let i = 0; i < chunks.length; i += DETAILS_CHUNK_CONCURRENCY) {
    const batch = chunks.slice(i, i + DETAILS_CHUNK_CONCURRENCY)
    const batchResults = await Promise.all(batch.map(keys =>
      api.multiCall({
        abi: abi.getPositionDetails,
        permitFailure: true,
        calls: keys.map(key => ({ target: CL_CORE, params: [key] })),
      })))

    batchResults.flat().forEach(d => {
      const p = d?.d ?? d
      if (!p || typeof p !== 'object') return

      if (p.token0 && p.amount0Now != null) api.add(p.token0, p.amount0Now)
      if (p.token1 && p.amount1Now != null) api.add(p.token1, p.amount1Now)
    })
  }
}

module.exports = {
  methodology: 'TVL is the sum of token amounts for all currently active positions registered in EZManager CLCore on Base.',
  doublecounted: true,
  base: { tvl },
}
