const sdk = require('@defillama/sdk')
const { getLogs2 } = require('./cache/getLogs')
const { sumTokens2 } = require('./unwrapLPs')
const { tickToPrice } = require('./utils/tick')

const graphIds = {
  base: 'Gqm2b5J85n1bhCyDMpGbtbVn4935EvvdyHdHrx3dibyj',
  ethereum: 'DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G',
}

// https://docs.uniswap.org/contracts/v4/deployments
// poolManager + fromBlock match the uniswap-v4 adapter so the Initialize log cache is shared with it
const chainConfig = {
  ethereum: { poolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90', fromBlock: 21688329, stateView: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227' },
  base: { poolManager: '0x498581ff718922c3f8e6a244956af099b2652b2b', fromBlock: 25350988, stateView: '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71' },
  arbitrum: { poolManager: '0x360e68faccca8ca495c1b759fd9eee466db9fb32', fromBlock: 297842872, stateView: '0x76Fd297e2D437cd7f76d50F01AfE6160f86e9990' },
  optimism: { poolManager: '0x9a13f98cb987694c9f086b1f5eb990eea8264ec3', fromBlock: 130947675, stateView: '0xc18a3169788F4F75A170290584ECA6395C75Ecdb' },
  bsc: { poolManager: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df', fromBlock: 45970610, stateView: '0xd13Dd3D6E93f276FAfc9Db9E6BB47C1180aeE0c4' },
  unichain: { poolManager: '0x1F98400000000000000000000000000000000004', fromBlock: 1, stateView: '0x86e8631A016F9068C3f085fAF484Ee3F5fDee8f2' },
  monad: { poolManager: '0x188d586ddcf52439676ca21a244753fa19f9ea8e', fromBlock: 29255895, stateView: '0x77395f3b2e73ae90843717371294fa97cc419d64' },
  robinhood: { poolManager: '0x8366a39CC670B4001A1121B8F6A443A643e40951', fromBlock: 9070, stateView: '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b' },
}

const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const getSlot0Abi = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const getTickBitmapAbi = 'function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256)'
const getTickInfoAbi = 'function getTickInfo(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128)'

const MIN_TICK = -887272
const MAX_TICK = 887272

// TVL of a hook's pools read from the Uniswap V4 subgraph
function uniV4HookExport({ hook }) {
  const query = `{

  pools (where:{
    hooks: "${hook.toLowerCase()}"
  }, orderBy:totalValueLockedUSD orderDirection:desc first: 999) {
        id
    token0 { symbol id  decimals }
    token1 { symbol id  decimals }
    totalValueLockedUSD
    totalValueLockedToken0
    totalValueLockedToken1
  }
}`
  return async (api) => {
    if (!hook) throw new Error('hook address is required')
    if (!graphIds[api.chain]) throw new Error(`Unsupported chain ${api.chain}`)
    const { pools } = await sdk.graph.request(graphIds[api.chain], query)
    pools.forEach(pool => {
      const token0 = pool.token0.id
      const token1 = pool.token1.id
      const balance0 = pool.totalValueLockedToken0 * (10 ** pool.token0.decimals)
      const balance1 = pool.totalValueLockedToken1 * (10 ** pool.token1.decimals)
      api.addToken(token0, balance0)
      api.addToken(token1, balance1)
    })
  }
}

// walk the initialized ticks and sum what the active liquidity of every range is worth at the live price
function poolReserves({ sqrtP, ticks, nets }) {
  const sp = Number(sqrtP) / 2 ** 96
  let amount0 = 0
  let amount1 = 0
  let liquidity = 0
  for (let i = 0; i < ticks.length - 1; i++) {
    liquidity += Number(nets[ticks[i]] ?? 0n)
    if (liquidity <= 0) continue
    const a = tickToPrice(ticks[i] / 2)
    const b = tickToPrice(ticks[i + 1] / 2)
    if (b <= sp) {
      amount1 += liquidity * (b - a)
    } else if (a >= sp) {
      amount0 += liquidity * (b - a) / (a * b)
    } else {
      amount1 += liquidity * (sp - a)
      amount0 += liquidity * (b - sp) / (sp * b)
    }
  }
  return { amount0, amount1 }
}

// pools running a hook, found from the PoolManager Initialize logs (v4 hashes the PoolKey into the id, the log is the one place the pair is on chain)
async function getHookPools({ api, hook, poolManager, fromBlock }) {
  const logs = await getLogs2({ api, factory: poolManager, eventAbi: initializeAbi, fromBlock })
  return logs
    .filter((log) => log.hooks.toLowerCase() === hook.toLowerCase())
    .map((log) => ({ id: log.id, token0: log.currency0, token1: log.currency1, spacing: Number(log.tickSpacing) }))
}

// adds the reserves of the given v4 pools ([{ id, token0, token1, spacing }]) to api, reconstructed from
// the pool's tick bitmap, tick liquidity and current price read via StateView (v4 keeps all pools in one PoolManager)
async function addUniV4PoolReserves({ api, pools, stateView }) {
  if (!pools.length) return
  const slot0s = await api.multiCall({ abi: getSlot0Abi, target: stateView, calls: pools.map((p) => p.id) })
  const live = []
  slot0s.forEach((s, i) => {
    const sqrtP = BigInt(s.sqrtPriceX96)
    if (sqrtP > 0n) live.push({ ...pools[i], sqrtP, ticks: [], nets: {} })
  })
  if (!live.length) return

  // every word of every pool's tick bitmap
  const words = []
  live.forEach((p, i) => {
    const lo = Math.floor(MIN_TICK / p.spacing) >> 8
    const hi = Math.floor(MAX_TICK / p.spacing) >> 8
    for (let w = lo; w <= hi; w++) words.push({ pool: i, word: w })
  })
  const bitmaps = await api.multiCall({ abi: getTickBitmapAbi, target: stateView, calls: words.map(({ pool, word }) => ({ params: [live[pool].id, word] })) })
  bitmaps.forEach((raw, i) => {
    const bits = BigInt(raw)
    if (bits === 0n) return
    const { pool, word } = words[i]
    for (let b = 0; b < 256; b++)
      if ((bits >> BigInt(b)) & 1n) live[pool].ticks.push(((word << 8) + b) * live[pool].spacing)
  })

  // liquidityNet at each initialized tick
  const tickCalls = []
  live.forEach((p, i) => {
    p.ticks.sort((a, b) => a - b)
    p.ticks.forEach((tick) => tickCalls.push({ pool: i, tick }))
  })
  if (tickCalls.length) {
    const tickData = await api.multiCall({ abi: getTickInfoAbi, target: stateView, calls: tickCalls.map(({ pool, tick }) => ({ params: [live[pool].id, tick] })) })
    tickData.forEach((info, i) => {
      const { pool, tick } = tickCalls[i]
      live[pool].nets[tick] = BigInt(info.liquidityNet)
    })
  }

  live.forEach((p) => {
    const { amount0, amount1 } = poolReserves(p)
    if (amount0 > 0) api.add(p.token0, amount0)
    if (amount1 > 0) api.add(p.token1, amount1)
  })
}

// TVL of a hook's pools read fully on chain; includeHookBalances also counts the pool tokens held by the hook contract itself
function uniV4HookOnChainExport({ hook, includeHookBalances = false, poolManager, fromBlock, stateView } = {}) {
  return async (api) => {
    if (!hook) throw new Error('hook address is required')
    const config = { ...(chainConfig[api.chain] ?? {}) }
    if (poolManager) config.poolManager = poolManager
    if (fromBlock) config.fromBlock = fromBlock
    if (stateView) config.stateView = stateView
    if (!config.poolManager || !config.fromBlock || !config.stateView) throw new Error(`Missing uniswap v4 config for chain ${api.chain}`)

    const pools = await getHookPools({ api, hook, poolManager: config.poolManager, fromBlock: config.fromBlock })
    if (!pools.length) throw new Error(`no uniswap v4 pools found for hook ${hook} on ${api.chain}`)
    await addUniV4PoolReserves({ api, pools, stateView: config.stateView })

    if (!includeHookBalances) return
    const tokens = [...new Set(pools.flatMap((p) => [p.token0, p.token1]))]
    return sumTokens2({ api, owner: hook, tokens })
  }
}

module.exports = {
  uniV4HookExport,
  uniV4HookOnChainExport,
  getHookPools,
  addUniV4PoolReserves,
  chainConfig,
}
