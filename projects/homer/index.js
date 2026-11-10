// Homer: the liquidity layer of Elysium (https://homer.finance).
// TVL is the liquidity in positions users opened through Homer: Uniswap v3-style NFTs held by
// HomerLiquidityManager contracts and Uniswap v4 positions held by HomerV4Manager contracts.
// Those positions sit in other DEXes' pools (KleosSwap, ElysPump, BOXA, Uniswap v4...), so the
// TVL is marked as double counted. Staked $HOMER is reported separately.

const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

// HomerLiquidityManager versions (v3 positions). Positions opened in earlier versions stay there
// until their owners move them, so every version is counted.
const V3_MANAGERS = [
  '0xff60e4f370c0243a820e0864ca92e1eb6ab7937e',
  '0xfcbd0977c9e610a1d53f56746d7b6cc5fb5fb9b9',
  '0x9ba039830404b8f658f8a79e774338cad510621a',
  '0xa70551dc12b4c2cd52b4a91127a204e8eb233d10',
  '0xdb61b2fba50ced1f6271963d9e357ed9d2136420',
]

// HomerV4Manager versions (Uniswap v4 positions) and the block each was deployed in.
const V4_MANAGERS = [
  { address: '0x2168787fa608338be994ba7e0e3852589ae0715f', fromBlock: 199157 },
  { address: '0xcf76489a3f2bda1a15825a600ef25d28315cf83c', fromBlock: 206024 },
  { address: '0x63b202b8c36b0cd35782af0068d0a60fd1394b86', fromBlock: 334629 },
]

// Uniswap v4 PositionManagers Homer opens positions through, and their PoolManager (any other is
// asked for its poolManager() at run time).
const V4_POOL_MANAGER = {
  '0x1f9b957071228a3190280e062cc62a3f66b6a13a': '0x5fb015a49f5b35073f9ce01c2adb287a75f89600', // ElysPump's v4
  '0x1d1c51b9d07fd27d36412a2b66cc23d19eb3e518': '0xe2e105d3f7209a9da11f83ccf3e7398a753823f1', // Uniswap v4
}

const HOMER = '0x365be4728d0ee2140e8b75a05c5dcf6b7d76399a'
const HOMER_STAKING = '0x5bdc2d45b54f909bae587ff3a051299e802fd6e8'
const HOMER_POOL = '0x42225e9732882875ad07e3acedfe5f4badf5b794' // KleosSwap v3 WHYPE/HOMER (token0 WHYPE, token1 HOMER)

const MINTED = 'event Minted(address indexed user, address indexed manager, uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)'
const REBALANCED = 'event Rebalanced(address indexed user, address indexed manager, uint256 indexed oldTokenId, uint256 newTokenId, uint128 liquidity, uint256 amount0, uint256 amount1)'
const POOL_AND_INFO = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) poolKey, uint256 info)'
const POSITION_LIQUIDITY = 'function getPositionLiquidity(uint256 tokenId) view returns (uint128)'
const EXTSLOAD = 'function extsload(bytes32 slot) view returns (bytes32)'
const POOLS_SLOT = 6n // PoolManager's `_pools` mapping

const int24 = (v) => { const n = Number(v & 0xffffffn); return n >= 0x800000 ? n - 0x1000000 : n }

async function v4Positions(api) {
  // Every position a Homer v4 manager opened (minted or created by a rebalance), still held by it.
  const held = [] // { nft, tokenId }
  for (const { address, fromBlock } of V4_MANAGERS) {
    const [minted, rebalanced] = await Promise.all([
      getLogs({ api, target: address, eventAbi: MINTED, fromBlock, onlyArgs: true, extraKey: 'minted' }),
      getLogs({ api, target: address, eventAbi: REBALANCED, fromBlock, onlyArgs: true, extraKey: 'rebalanced' }),
    ])
    const ids = [...minted.map((l) => [l.manager, l.tokenId]), ...rebalanced.map((l) => [l.manager, l.newTokenId])]
    const owners = await api.multiCall({ abi: 'function ownerOf(uint256) view returns (address)', calls: ids.map(([nft, id]) => ({ target: nft, params: [id] })), permitFailure: true })
    ids.forEach(([nft, id], i) => { if (owners[i] && owners[i].toLowerCase() === address) held.push({ nft: nft.toLowerCase(), tokenId: id }) })
  }
  if (!held.length) return

  const calls = held.map(({ nft, tokenId }) => ({ target: nft, params: [tokenId] }))
  const liquidityAll = await api.multiCall({ abi: POSITION_LIQUIDITY, calls })
  // Emptied positions (liquidity 0) hold nothing: skip them.
  const live = held.map((p, i) => ({ ...p, call: calls[i], liquidity: liquidityAll[i] })).filter((p) => BigInt(p.liquidity) > 0n)
  if (!live.length) return
  const infos = await api.multiCall({ abi: POOL_AND_INFO, calls: live.map((p) => p.call) })

  // Each PositionManager's PoolManager: the known ones from the list, any other asked directly
  // (a Homer V4 manager can be allowed a new PositionManager later; TVL must not fail on it).
  const poolManagers = { ...V4_POOL_MANAGER }
  const unknown = [...new Set(live.map((p) => p.nft))].filter((nft) => !poolManagers[nft])
  if (unknown.length) {
    const found = await api.multiCall({ abi: 'address:poolManager', calls: unknown })
    unknown.forEach((nft, i) => { poolManagers[nft] = found[i].toLowerCase() })
  }

  // Pool price from the PoolManager's storage (slot0 of each pool), the way StateView reads it.
  const coder = new (require('ethers').AbiCoder)()
  const { keccak256 } = require('ethers')
  const poolOf = infos.map(({ poolKey: k }, i) => {
    const id = keccak256(coder.encode(['address', 'address', 'uint24', 'int24', 'address'], [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks]))
    return { id, manager: poolManagers[live[i].nft] }
  })
  const slots = await api.multiCall({
    abi: EXTSLOAD,
    calls: poolOf.map(({ id, manager }) => ({ target: manager, params: [keccak256(coder.encode(['bytes32', 'uint256'], [id, POOLS_SLOT]))] })),
  })

  infos.forEach(({ poolKey, info }, i) => {
    const packed = BigInt(info)
    const slot0 = BigInt(slots[i])
    addUniV3LikePosition({
      api,
      token0: poolKey.currency0,
      token1: poolKey.currency1,
      liquidity: Number(live[i].liquidity),
      tickLower: int24(packed >> 8n),
      tickUpper: int24(packed >> 32n),
      tick: int24(slot0 >> 160n),
    })
  })
}

// Staked $HOMER, valued in HYPE at the pool's price (WHYPE is 1:1 HYPE).
async function staking(api) {
  const [staked, slot0] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf', target: HOMER, params: [HOMER_STAKING] }),
    api.call({ abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)', target: HOMER_POOL }),
  ])
  const sqrtP = BigInt(slot0.sqrtPriceX96)
  // price = HOMER per WHYPE = sqrtP^2 / 2^192, so HYPE value = staked * 2^192 / sqrtP^2
  const hype = (BigInt(staked) << 192n) / (sqrtP * sqrtP)
  api.addGasToken(hype.toString())
  return api.getBalances()
}

async function tvl(api) {
  // Each manager lists the position managers (Uniswap v3 NFTs) it accepts.
  const nfts = await api.multiCall({ abi: 'address[]:managers', calls: V3_MANAGERS })
  await sumTokens2({ api, uniV3nftsAndOwners: V3_MANAGERS.flatMap((owner, i) => nfts[i].map((nft) => [nft, owner])) })
  await v4Positions(api)
  return api.getBalances()
}

module.exports = {
  doublecounted: true,
  methodology: 'TVL is the liquidity in positions users opened through Homer: Uniswap v3-style NFTs held by HomerLiquidityManager contracts and Uniswap v4 positions held by HomerV4Manager contracts. These positions sit in other DEXes\' pools, so the TVL is double counted with those DEXes. Staking is the $HOMER staked in HomerStaking.',
  start: '2026-10-30',
  elysium: {
    tvl,
    staking,
  },
}
