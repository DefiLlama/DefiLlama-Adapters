const sdk = require('@defillama/sdk')
const { AbiCoder, keccak256 } = require('ethers')
const { getCache, setCache } = require('../helper/cache')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getHookPools, addUniV4PoolReserves } = require('../helper/uniswapV4')

// Helios (https://heliosliq.app): a liquidity platform on Elysium. TVL has two parts.
//
// 1. Helios' own pools. Its DLMM (bin) and DAMM (full range) pools are Uniswap v4 pools carrying the Helios
//    fee hook. Only launchers registered on the hook can initialize a pool with it, so every pool with one
//    of these hooks is a Helios pool. v4 keeps every pool's tokens in one PoolManager, so each pool's
//    reserves are rebuilt on chain from its tick liquidity and current price (StateView).
//
// 2. Positions opened through the Helios app in other DEXes' Uniswap v4 pools. Such a deposit goes straight
//    to that DEX's PositionManager and the position NFT stays in the user's wallet, so the app marks the
//    transaction instead: it appends 8 bytes ("helios" + version 1) to the calldata of every deposit it
//    sends (Solidity ignores calldata past a call's arguments). A position is counted from its first marked
//    deposit and valued at the liquidity it holds now, so a withdrawal made anywhere takes it back out.
//    Deposits from before the app started marking (2026-11-07) cannot be told apart and are not counted.
//
// Both parts sit in pools that other listings count (Uniswap v4, ElysPump), hence doublecounted.
// Addresses: https://heliosliq.app/#contracts (explorer: https://elysium.kinetiq.xyz)
const POOL_MANAGER = '0xE2e105d3F7209A9DA11f83cCf3E7398a753823F1' // Uniswap v4 PoolManager on Elysium
const STATE_VIEW = '0x27eD73aE0652fdCf71d6793412A7525f32bE9dfE' // Uniswap v4 StateView on Elysium
const FROM_BLOCK = 256083 // same as the uniswap-v4 adapter, so the Initialize log cache is shared with it
const FEE_HOOKS = [
  '0xa129c69D439f30e6FfACC435a1627b7f4F9d30c4', // HeliosFeeHook
  '0x885E170Ab95421C38175d6aD43017b54AD6E30c4', // HeliosFeeHook v2
].map((a) => a.toLowerCase())

// v4 deployments the app deposits into: PoolManager and the PositionManager deposits go through
const VENUES = [
  { poolManager: POOL_MANAGER, positionManager: '0x1d1C51b9d07fD27d36412A2b66CC23D19Eb3E518' }, // Uniswap v4
  { poolManager: '0x5fb015a49f5b35073f9ce01c2adb287a75f89600', positionManager: '0x1f9b957071228a3190280e062cc62a3f66b6a13a' }, // ElysPump's v4
]
const HELIOS_MARK = '68656c696f730001' // "helios" in hex, then version 1
const MARK_FROM_BLOCK = 2203949 // the app's first marked deposit (2026-11-07)

const MODIFY_LIQUIDITY = 'event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)'
const MODIFY_LIQUIDITY_TOPIC = '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec'
const POSITION_LIQUIDITY = 'function getPositionLiquidity(uint256 tokenId) view returns (uint128)'
const POOL_AND_INFO = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 info)'
const EXTSLOAD = 'function extsload(bytes32 slot) view returns (bytes32)'
const POOLS_SLOT = 6n // PoolManager's `_pools` mapping
const TX_CHUNK = 10

const coder = new AbiCoder()
const int24 = (v) => { const n = Number(v & 0xffffffn); return n >= 0x800000 ? n - 0x1000000 : n }
const topicOf = (address) => '0x' + address.slice(2).toLowerCase().padStart(64, '0')

// Positions ("<positionManager>:<tokenId>") with a marked deposit. The cache keeps the list and the block
// it was read to, so a run only reads the deposits made since the last one.
async function markedPositions(api) {
  const cache = await getCache('heliosliq', api.chain)
  const found = new Set(cache.positions ?? [])
  const fromBlock = (cache.toBlock ?? MARK_FROM_BLOCK - 1) + 1
  await api.getBlock()
  if (fromBlock > api.block) return [...found]

  for (const { poolManager, positionManager } of VENUES) {
    const nft = positionManager.toLowerCase()
    // liquidity added through the PositionManager: `sender` is the PositionManager, `salt` the position's token id
    const logs = await sdk.getEventLogs({
      chain: api.chain, target: poolManager, eventAbi: MODIFY_LIQUIDITY, topics: [MODIFY_LIQUIDITY_TOPIC, null, topicOf(nft)],
      fromBlock, toBlock: api.block, onlyArgs: false,
    })
    const adds = logs
      .filter((log) => BigInt(log.args.liquidityDelta) > 0n)
      .map((log) => ({ tokenId: BigInt(log.args.salt).toString(), hash: log.transactionHash }))
      .filter(({ tokenId }) => !found.has(`${nft}:${tokenId}`))
    // only positions that still hold liquidity can add to TVL: their deposits are the ones read for the mark
    const ids = [...new Set(adds.map((a) => a.tokenId))]
    const liquidity = await api.multiCall({ abi: POSITION_LIQUIDITY, target: nft, calls: ids, permitFailure: true })
    const live = new Set(ids.filter((_, i) => liquidity[i] && BigInt(liquidity[i]) > 0n))
    const hashes = [...new Set(adds.filter((a) => live.has(a.tokenId)).map((a) => a.hash))]
    const marked = new Set()
    for (let i = 0; i < hashes.length; i += TX_CHUNK) {
      const txs = await Promise.all(hashes.slice(i, i + TX_CHUNK).map((hash) => api.provider.getTransaction(hash)))
      txs.forEach((tx, j) => {
        if (!tx) throw new Error(`heliosliq: transaction ${hashes[i + j]} not found`)
        if (tx.data.toLowerCase().endsWith(HELIOS_MARK)) marked.add(hashes[i + j])
      })
    }
    adds.forEach(({ tokenId, hash }) => { if (marked.has(hash)) found.add(`${nft}:${tokenId}`) })
  }

  await setCache('heliosliq', api.chain, { toBlock: api.block, positions: [...found] })
  return [...found]
}

// Adds what the marked positions hold now: each one's current liquidity over its tick range, at its
// pool's current tick. Burned or emptied positions add nothing, and positions in Helios' own pools are
// skipped because those pools' reserves are already counted in full.
async function addMarkedPositions(api) {
  const positions = (await markedPositions(api)).map((key) => key.split(':'))
  if (!positions.length) return
  const calls = positions.map(([nft, tokenId]) => ({ target: nft, params: [tokenId] }))
  // a burned position cannot be read any more: it holds nothing
  const liquidity = await api.multiCall({ abi: POSITION_LIQUIDITY, calls, permitFailure: true })
  const live = positions.map(([nft], i) => ({ nft, call: calls[i], liquidity: liquidity[i] })).filter((p) => p.liquidity && BigInt(p.liquidity) > 0n)
  if (!live.length) return
  const infos = await api.multiCall({ abi: POOL_AND_INFO, calls: live.map((p) => p.call) })

  // each pool's current tick, from the PoolManager's storage (slot0 of the pool)
  const poolManagerOf = Object.fromEntries(VENUES.map((v) => [v.positionManager.toLowerCase(), v.poolManager]))
  const slots = await api.multiCall({
    abi: EXTSLOAD,
    calls: infos.map(({ poolKey: k }, i) => {
      const id = keccak256(coder.encode(['address', 'address', 'uint24', 'int24', 'address'], [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks]))
      return { target: poolManagerOf[live[i].nft], params: [keccak256(coder.encode(['bytes32', 'uint256'], [id, POOLS_SLOT]))] }
    }),
  })

  infos.forEach(({ poolKey, info }, i) => {
    // a position in a Helios pool is already in that pool's reserves
    if (FEE_HOOKS.includes(poolKey.hooks.toLowerCase())) return
    const packed = BigInt(info)
    addUniV3LikePosition({
      api,
      token0: poolKey.currency0,
      token1: poolKey.currency1,
      liquidity: Number(live[i].liquidity),
      tickLower: int24(packed >> 8n),
      tickUpper: int24(packed >> 32n),
      tick: int24(BigInt(slots[i]) >> 160n),
    })
  })
}

// TVL: the reserves of every pool on a Helios fee hook, then the marked positions in other DEXes' pools.
async function tvl(api) {
  const pools = []
  for (const hook of FEE_HOOKS)
    pools.push(...await getHookPools({ api, hook, poolManager: POOL_MANAGER, fromBlock: FROM_BLOCK }))
  await addUniV4PoolReserves({ api, pools, stateView: STATE_VIEW })
  await addMarkedPositions(api)
}

module.exports = {
  doublecounted: true, // the pools live in other listings' PoolManagers (Uniswap v4, ElysPump), which count them too
  methodology: 'Counts the liquidity in Helios DLMM and DAMM pools (the Uniswap v4 pools that carry the Helios fee hook), plus the liquidity of positions that users opened through the Helios app in other DEXes\' Uniswap v4 pools. Helios pools are found from the PoolManager\'s Initialize events and their reserves are rebuilt on chain from tick liquidity and the current price via StateView. Positions opened through the app are found from the mark the app appends to the calldata of every deposit it sends to a PositionManager, and are valued at the liquidity they hold now. Those positions stay in the users\' wallets and sit in other DEXes\' pools, so all of this TVL is double counted with those DEXes.',
  start: '2026-11-04',
  elysium: { tvl },
}
