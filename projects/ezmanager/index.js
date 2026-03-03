const { getLogs } = require('../helper/cache/getLogs')

const CL_CORE = '0x61c36AFF32Be348a3D1FE1E2B4745048f652770F'
const FROM_BLOCK = 42111754
const DETAILS_CHUNK_SIZE = 50
const DETAILS_CHUNK_CONCURRENCY = 5

const abi = {
  getPositionDetails: {
    type: 'function',
    name: 'getPositionDetails',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{
      name: 'd',
      type: 'tuple',
      internalType: 'struct PositionDetails',
      components: [
        { name: 'key', type: 'bytes32', internalType: 'bytes32' },
        { name: 'owner', type: 'address', internalType: 'address' },
        { name: 'tokenId', type: 'uint256', internalType: 'uint256' },
        { name: 'pool', type: 'address', internalType: 'address' },
        { name: 'token0', type: 'address', internalType: 'address' },
        { name: 'token1', type: 'address', internalType: 'address' },
        { name: 'fee', type: 'uint24', internalType: 'uint24' },
        { name: 'tickSpacing', type: 'int24', internalType: 'int24' },
        { name: 'tickLower', type: 'int24', internalType: 'int24' },
        { name: 'tickUpper', type: 'int24', internalType: 'int24' },
        { name: 'currentTick', type: 'int24', internalType: 'int24' },
        { name: 'liquidity', type: 'uint128', internalType: 'uint128' },
        { name: 'tokensOwed0', type: 'uint128', internalType: 'uint128' },
        { name: 'tokensOwed1', type: 'uint128', internalType: 'uint128' },
        { name: 'pendingFees0', type: 'uint256', internalType: 'uint256' },
        { name: 'pendingFees1', type: 'uint256', internalType: 'uint256' },
        { name: 'pendingFeesUSDC', type: 'uint256', internalType: 'uint256' },
        { name: 'amount0Now', type: 'uint256', internalType: 'uint256' },
        { name: 'amount1Now', type: 'uint256', internalType: 'uint256' },
        { name: 'valueUSDCNow', type: 'uint256', internalType: 'uint256' },
        { name: 'dustUSDC', type: 'uint256', internalType: 'uint256' },
        { name: 'totalDepositedUSDC', type: 'uint256', internalType: 'uint256' },
        { name: 'openedAt', type: 'uint256', internalType: 'uint256' },
        { name: 'dex', type: 'address', internalType: 'address' },
        { name: 'botAllowed', type: 'bool', internalType: 'bool' },
      ],
    }],
  },
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
