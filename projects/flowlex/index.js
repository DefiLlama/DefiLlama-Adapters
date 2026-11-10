const { getLogs2 } = require('../helper/cache/getLogs')
const { unwrapUniswapV3NFT } = require('../helper/unwrapLPs')

// Flowlex is non-custodial: users open Uniswap V3 positions through the LP manager, a pass-through helper that holds
// no funds and sends the position NFT straight to the user's own smart wallet. Those wallets can hold other Uniswap
// positions, so we count only the token ids the manager itself minted (it emits them).
// Every position is counted as liquidity plus its uncollected fees. Closed positions drop out:
// withdraw leaves zero liquidity and burn removes the NFT.
const config = {
  base: {
    manager: '0xE20435aC8160aa58ADea4A1fc5641bB5aDAED053',
    managerFromBlock: 44474281,
    openEvents: ['positionOpened'],
    nfpm: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', // Uniswap V3 NonfungiblePositionManager
  },
  robinhood: {
    // same manager address as on Base; this deployment can also open from the pool's own tokens
    manager: '0xE20435aC8160aa58ADea4A1fc5641bB5aDAED053',
    managerFromBlock: 106211342,
    openEvents: ['positionOpened', 'positionOpenedDual'],
    nfpm: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3',
  },
}

const abis = {
  positionOpened: 'event PositionOpened(address indexed user, uint256 indexed tokenId, address pool, uint256 depositAmount, uint256 commission)',
  positionOpenedDual: 'event PositionOpenedDual(address indexed user, uint256 indexed tokenId, address pool, uint256 amountUsdc, uint256 amountOther, uint256 commissionUsdc, uint256 commissionOther)',
  positionRebalanced: 'event PositionRebalanced(address indexed user, uint256 indexed oldTokenId, uint256 indexed newTokenId)',
  ownerOf: 'function ownerOf(uint256) view returns (address)',
  positions: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  factory: 'address:factory',
  getPool: 'function getPool(address, address, uint24) view returns (address)',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  feeGrowthGlobal0X128: 'uint256:feeGrowthGlobal0X128',
  feeGrowthGlobal1X128: 'uint256:feeGrowthGlobal1X128',
  ticks: 'function ticks(int24) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)',
}

async function managerTokenIds(api, cfg) {
  const fetch = (event) => getLogs2({ api, target: cfg.manager, eventAbi: abis[event], fromBlock: cfg.managerFromBlock, extraKey: event })
  const [rebalanced, ...opened] = await Promise.all([fetch('positionRebalanced'), ...cfg.openEvents.map(fetch)])
  return [...new Set([...opened.flat().map(i => i.tokenId), ...rebalanced.map(i => i.newTokenId)].map(String))]
}

// A failed ownerOf in the batch is retried alone: the id is dropped only when the position manager confirms the token
// does not exist (burned); any other failure (e.g. RPC) throws instead of silently undercounting.
async function isLive(api, nfpm, id) {
  try {
    await api.call({ abi: abis.ownerOf, target: nfpm, params: [id] })
    return true
  } catch (e) {
    if (String(e?.message ?? e).includes('nonexistent token')) return false
    throw e
  }
}

// Fees a position could collect right now: tokensOwed plus what it earned since its last update,
// using the same fee-growth math as the Uniswap V3 position manager.
const Q128 = 2n ** 128n
const MOD = 2n ** 256n
const sub = (a, b) => ((a - b) % MOD + MOD) % MOD

async function addUncollectedFees(api, nfpm, positionIds) {
  const positions = (await api.multiCall({ abi: abis.positions, target: nfpm, calls: positionIds })).filter(p => BigInt(p.liquidity) > 0n || BigInt(p.tokensOwed0) > 0n || BigInt(p.tokensOwed1) > 0n)
  if (!positions.length) return

  const factory = await api.call({ abi: abis.factory, target: nfpm })
  const pools = await api.multiCall({ abi: abis.getPool, target: factory, calls: positions.map(p => ({ params: [p.token0, p.token1, p.fee] })) })
  const uniquePools = [...new Set(pools)]
  const [slot0s, global0s, global1s, lowers, uppers] = await Promise.all([
    api.multiCall({ abi: abis.slot0, calls: uniquePools }),
    api.multiCall({ abi: abis.feeGrowthGlobal0X128, calls: uniquePools }),
    api.multiCall({ abi: abis.feeGrowthGlobal1X128, calls: uniquePools }),
    api.multiCall({ abi: abis.ticks, calls: positions.map((p, i) => ({ target: pools[i], params: [p.tickLower] })) }),
    api.multiCall({ abi: abis.ticks, calls: positions.map((p, i) => ({ target: pools[i], params: [p.tickUpper] })) }),
  ])
  const poolState = {}
  uniquePools.forEach((pool, i) => { poolState[pool] = { tick: Number(slot0s[i].tick), global: [BigInt(global0s[i]), BigInt(global1s[i])] } })

  positions.forEach((p, i) => {
    const { tick, global } = poolState[pools[i]]
    const tickLower = Number(p.tickLower)
    const tickUpper = Number(p.tickUpper)
    const liquidity = BigInt(p.liquidity)
    const last = [BigInt(p.feeGrowthInside0LastX128), BigInt(p.feeGrowthInside1LastX128)]
    const owed = [BigInt(p.tokensOwed0), BigInt(p.tokensOwed1)]
    const outside = (t, k) => BigInt(t[k === 0 ? 'feeGrowthOutside0X128' : 'feeGrowthOutside1X128'])

    ;[p.token0, p.token1].forEach((token, k) => {
      const below = tick >= tickLower ? outside(lowers[i], k) : sub(global[k], outside(lowers[i], k))
      const above = tick < tickUpper ? outside(uppers[i], k) : sub(global[k], outside(uppers[i], k))
      const inside = sub(sub(global[k], below), above)
      const earned = (liquidity * sub(inside, last[k])) / Q128
      const total = owed[k] + earned
      if (total > 0n) api.add(token, total.toString())
    })
  })
}

async function tvl(api) {
  const cfg = config[api.chain]
  const ids = await managerTokenIds(api, cfg)
  if (!ids.length) return

  // Burned NFTs revert on positions(), so keep only ids that still exist.
  const owners = await api.multiCall({ abi: abis.ownerOf, target: cfg.nfpm, calls: ids, permitFailure: true })
  const positionIds = []
  for (let i = 0; i < ids.length; i++) {
    if (owners[i] || await isLive(api, cfg.nfpm, ids[i])) positionIds.push(ids[i])
  }
  if (!positionIds.length) return

  await unwrapUniswapV3NFT({ api, nftAddress: cfg.nfpm, uniV3ExtraConfig: { positionIds } })
  await addUncollectedFees(api, cfg.nfpm, positionIds)
}

module.exports = {
  doublecounted: true,
  methodology:
    'Counts the Uniswap V3 positions opened through Flowlex, valued at the pool\'s current price, plus each position\'s uncollected fees. ' +
    'Positions are the NFTs minted by the Flowlex LP manager (found by its PositionOpened and PositionRebalanced events); they sit in ' +
    'the users\' own smart wallets, and other Uniswap positions in those wallets are not counted. Closed and burned positions are ' +
    'excluded. Double counted with Uniswap V3.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
