const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

// Fynd AMM pools are Ekubo v3 pools that use Fynd's SignedExclusiveSwap extension.
// Ekubo Core holds the tokens of every pool, so TVL is rebuilt per pool from the liquidity stored at its ticks.
const CORE = '0x00000000000014aA86C5d3c41765bb24e11bd701'

const EXTENSION_V1 = '0x55b703eED01b35641963da2FB2E14885993605A3'
const EXTENSION = '0x550CFe1292d0D9c0d28f232b3F42Edb4439B1D09'

// fromBlock is the block in which the first Fynd AMM pool was initialized on that chain.
const config = {
  ethereum: { extensions: [EXTENSION_V1, EXTENSION], fromBlock: 25689059 },
  robinhood: { extensions: [EXTENSION], fromBlock: 72277109 },
  base: { extensions: [EXTENSION], fromBlock: 53151641 },
  bsc: { extensions: [EXTENSION], fromBlock: 130064169 },
}

// Test pools that are not listed in the Fynd app.
const excludedPools = new Set([
  '0x22c2b655277ac0d151ab5844d49f3ddf6118e555e35be89d3cf3f476647af38b', // ethereum USDC/WETH
  '0x29936f43df20cce7583ff081144b26fc8984cd38d3f413f04695640928729524', // robinhood USDG/UBIK
  '0xf893e7a59d7645501877e680332860a61f784332e7e722a5e9bb9a8cbad38656', // robinhood SPY/USDG
])

const eventAbis = {
  poolInitialized: 'event PoolInitialized(bytes32 poolId, (address token0, address token1, bytes32 config) poolKey, int32 tick, uint96 sqrtRatio)',
  positionUpdated: 'event PositionUpdated(address locker, bytes32 poolId, bytes32 positionId, int128 liquidityDelta, bytes32 balanceUpdate, bytes32 stateAfter)',
}

// Core exposes raw storage through `sload()`: the slots to read follow the selector in calldata.
const SLOAD_SELECTOR = '0x380eb4e0'
// Tick info is stored at slot poolId + tick + TICKS_OFFSET (Ekubo CoreStorageLayout).
const TICKS_OFFSET = 0x435a5eb89a296820174331cf5a3902d9fca683928d56726d8e7acd6efb28c568n
const SLOAD_BATCH = 500

// Ekubo prices are 1.000001^tick, so the square root price is 1.000001^(tick / 2).
const sqrtPrice = (tick) => Math.pow(1.000001, tick / 2)
const toInt32 = (value) => Number(BigInt.asIntN(32, value))
const toSlot = (value) => BigInt.asUintN(256, value).toString(16).padStart(64, '0')

async function sload(api, slots) {
  const words = []
  for (let i = 0; i < slots.length; i += SLOAD_BATCH) {
    const data = SLOAD_SELECTOR + slots.slice(i, i + SLOAD_BATCH).map(toSlot).join('')
    const res = await sdk.getProvider(api.chain).call({ to: CORE, data, blockTag: api.block ?? undefined })
    for (let j = 2; j < res.length; j += 64) words.push(BigInt('0x' + res.slice(j, j + 64)))
  }
  return words
}

async function tvl(api) {
  const { fromBlock } = config[api.chain]
  const extensions = new Set(config[api.chain].extensions.map((extension) => BigInt(extension)))

  // The top 20 bytes of a pool config are its extension, so this finds every Fynd AMM pool on-chain.
  const initialized = await getLogs({ api, target: CORE, eventAbi: eventAbis.poolInitialized, fromBlock, onlyArgs: true, extraKey: 'fynd-amm-pools' })
  const pools = {}
  initialized.forEach(({ poolId, poolKey }) => {
    if (!extensions.has(BigInt(poolKey.config) >> 96n) || excludedPools.has(poolId.toLowerCase())) return
    pools[poolId.toLowerCase()] = { token0: poolKey.token0, token1: poolKey.token1, ticks: new Set() }
  })
  const poolIds = Object.keys(pools)
  if (!poolIds.length) return

  // A position ID packs salt (24 bytes), lower tick and upper tick. The logs only give the ticks that
  // positions have used; the liquidity at each tick is then read from Core, so it is always current.
  const updates = await getLogs({ api, target: CORE, eventAbi: eventAbis.positionUpdated, fromBlock, onlyArgs: true, extraKey: 'fynd-amm-positions' })
  updates.forEach(({ poolId, positionId }) => {
    const pool = pools[poolId.toLowerCase()]
    if (!pool) return
    const id = BigInt(positionId)
    pool.ticks.add(toInt32(id >> 32n))
    pool.ticks.add(toInt32(id))
  })

  // Pool state is stored at slot `poolId`: sqrtRatio (96 bits) | tick (32 bits) | liquidity (128 bits).
  // Tick info is liquidityNet (128 bits) | liquidityDelta (int128).
  const slots = []
  poolIds.forEach((poolId) => {
    const pool = pools[poolId]
    pool.ticks = [...pool.ticks].sort((a, b) => a - b)
    slots.push(BigInt(poolId))
    pool.ticks.forEach((tick) => slots.push(BigInt(poolId) + BigInt(tick) + TICKS_OFFSET))
  })
  const words = await sload(api, slots)

  let i = 0
  poolIds.forEach((poolId) => {
    const { token0, token1, ticks } = pools[poolId]
    const current = sqrtPrice(toInt32(words[i++] >> 128n))
    let liquidity = 0n
    let amount0 = 0
    let amount1 = 0
    ticks.forEach((tick, j) => {
      liquidity += BigInt.asIntN(128, words[i++])
      if (j === ticks.length - 1 || liquidity <= 0n) return
      const sqrtLower = sqrtPrice(tick)
      const sqrtUpper = sqrtPrice(ticks[j + 1])
      const price = Math.min(Math.max(current, sqrtLower), sqrtUpper)
      amount0 += Number(liquidity) * (1 / price - 1 / sqrtUpper)
      amount1 += Number(liquidity) * (price - sqrtLower)
    })
    api.add(token0, Math.floor(amount0))
    api.add(token1, Math.floor(amount1))
  })
}

module.exports = {
  methodology: 'TVL is the value of the liquidity deposited in Fynd AMM pools. Fynd AMM pools are Ekubo v3 pools that use the Fynd SignedExclusiveSwap extension. The adapter finds these pools from Ekubo Core PoolInitialized events, collects the position ticks from PositionUpdated events, reads the current liquidity at each tick from Ekubo Core storage, and converts it to token amounts at the current pool price. Three test pools that are not listed in the Fynd app are excluded. Uncollected fees are not counted.',
  doublecounted: true,
  start: '2026-08-05', // first Fynd AMM pool initialized on Ethereum, block 25689059
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
