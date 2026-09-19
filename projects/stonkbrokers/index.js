const ethers = require('ethers')
const { sumTokens2, unwrapSlipstreamNFT, sumTokensExport } = require('../helper/unwrapLPs')
const { tickToPrice } = require('../helper/utils/tick')
const ADDRESSES = require('../helper/coreAssets.json')

// Safety Deposit Box — Uniswap V3 box locker (position NFTs escrowed
// permanently or on long vests) + the up. DEX (Slipstream) box locker, which
// also holds every Safe Launch pad graduation pool (100% of each launch's
// raise + LP tax reserve is locked there forever at bond) + the Uniswap v4
// box locker (PoolManager positions, no NFT) + the up. V2 LP locker + the
// ownerless forever-escrow holding the canonical ETH/STONKBROKER v4 LP.
const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'
const V4_BOX_LOCKER = '0x5a28ce098750f73bc9eC142D4bCE464E1A0BBdA6'
const UP_V2_BOX_LOCKER = '0x21797736C25851A6102D196afbA78F978f589017'
const FOREVER_ESCROW = '0x1338c12dAb6D80313819612784cC3C5bfaaD7f4d'
// Canonical ETH/STONKBROKER 1% Uniswap v4 posm NFT held by the forever escrow.
const FOREVER_POSM_ID = 175704
// First block each locker exists. Calls before this throw and wipe the
// chain's historical TVL, so each surface is skipped until it is live.
const V4_BOX_BLOCK = 19331425
const UP_V2_BOX_BLOCK = 32711195
const FOREVER_ESCROW_BLOCK = 19498880
// StonkLockerOwnershipNFT: slot 6 owner, slot 7 locker, slot 8 _nextTokenId.
// Verified on the live V4 (next = 87) and up. V2 (next = 8) receipt NFTs.
const LOCK_NFT_NEXT_ID_SLOT = 8

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

// A lock must have one of these as a quote or it is a fake-pool spam lock.
// Both legs are still credited (DefiLlama prices known tokens, rest stay $0).
// Native ETH pairs use address(0) on Uniswap v4.
const PRICED_TOKENS = [
  ADDRESSES.null,
  ADDRESSES.robinhood.WETH,
  ADDRESSES.robinhood.USDG,
  STONKBROKER,
]

// Smart LP (Volatility Farming) — immutable concentrated-liquidity vaults on
// canonical Uniswap V3 pools. The on-chain registry is the single discovery
// surface; each listed vault owns exactly one NFPM position plus small idle
// token balances between compounds.
const SMART_LP_REGISTRY = '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146'
const SMART_LP_REGISTRY_BLOCK = 55893170
// Same vault bytecode, chain-local registry. First VaultListed on Arbitrum
// is block 505449978 (2026-09-15); the from-block sits just before that.
const ARB_SMART_LP_REGISTRY = '0xFB2eA53b16C07011d4390A2e449385180A54eD5e'
const ARB_SMART_LP_FROM_BLOCK = 505000000
const ARB_UNI_V3_NFPM = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

// Nightshades (Civilization) anti-snipe launch — the StonkBrokers-built
// CivAntiSnipePad runs a 99%→1% decaying snipe tax over a 99-minute window
// per faction token. The WETH raise is escrowed in the pad until bond, then
// deposited as a protocol-owned Uniswap v4 position keyed to the
// FactionLiquidityVault (raw PoolManager position, no NFT). The vault also
// holds the earmarked snipe-tax WETH (next-night boost pot + per-faction LP
// pots) between night rounds.
const CIV_ANTI_SNIPE_PAD = '0xca389585c4940B107D49AF4A37aD259c5fb69081'
const CIV_FACTION_VAULT = '0xfff716727d7E80E29eab5D3498b7F28431e65C58'
const UNI_V4_POOL_MANAGER = '0x8366a39cc670b4001a1121b8f6a443a643e40951'
// Pad and vault landed in the same minute. Reading either before this block
// reverts and would zero the whole historical robinhood series.
const CIV_STACK_BLOCK = 62553796
// PoolManager `_pools` mapping slot (Pool.State is at storage slot 6).
const V4_POOLS_SLOT = 6n

const civVaultAbi = {
  factionCount: 'uint256:factionCount',
  factionIds: 'function factionIds(uint256) view returns (bytes32)',
  faction:
    'function faction(bytes32 factionId) view returns (address token, bool tokenIs0, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper)',
  positionLiquidity: 'function positionLiquidity(bytes32 factionId) view returns (uint128)',
}
const v4LockAbi =
  'function lockPositions(uint256) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks, int24 tickLower, int24 tickUpper, uint128 initialLiquidity, uint128 withdrawnLiquidity, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed)'
const upV2LockAbi =
  'function lockPositions(uint256) view returns (address pool, address vault, address token0, address token1, uint256 lockTokenId, uint256 initialAmount, uint256 withdrawnAmount, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed, address gauge)'
const extsloadAbi = 'function extsload(bytes32 slot) view returns (bytes32)'

const PRICED_SET = new Set(PRICED_TOKENS.map((t) => t.toLowerCase()))

function isPriced(token) {
  if (!token) return false
  const addr = token.toLowerCase()
  return PRICED_SET.has(addr) || addr === ADDRESSES.null.toLowerCase()
}

function isEthLike(token) {
  if (!token) return true
  const addr = token.toLowerCase()
  return addr === ADDRESSES.null.toLowerCase() || addr === ADDRESSES.robinhood.WETH.toLowerCase()
}

function pricedToken(token) {
  if (!token || token === '0x0000000000000000000000000000000000000000') return ADDRESSES.null
  return token
}

function liveAt(api, block) {
  return api.block == null || Number(api.block) >= block
}

// Credit both legs. The caller already required a known quote token and
// dropped spam liquidity, so a stock / meme base is safe to add: DefiLlama
// prices the ones it knows and leaves the rest at $0.
function addLegs(api, currency0, currency1, amount0, amount1) {
  const add = (token, amount) => {
    let n
    if (typeof amount === 'bigint') n = amount
    else if (typeof amount === 'string') {
      const whole = amount.split('.')[0]
      if (!whole || whole === '0' || whole === '-0') return
      n = BigInt(whole)
    } else {
      if (!Number.isFinite(amount) || amount <= 0) return
      n = BigInt(Math.round(amount))
    }
    if (n <= 0n) return
    api.add(pricedToken(token), n.toString())
  }
  add(currency0, amount0)
  add(currency1, amount1)
}

async function lastMintedLockId(api, locker) {
  const nft = await api.call({ abi: 'address:lockNft', target: locker })
  const word = api.block == null
    ? await api.provider.getStorage(nft, LOCK_NFT_NEXT_ID_SLOT)
    : await api.provider.getStorage(nft, LOCK_NFT_NEXT_ID_SLOT, api.block)
  const next = BigInt(word)
  if (next <= 1n) return 0
  if (next > 20001n) throw new Error(`unexpected lockNft next id ${next} on ${locker}`)
  return Number(next - 1n)
}

function v4PoolId(key) {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint24', 'int24', 'address'],
      [key.currency0, key.currency1, key.fee, key.tickSpacing, key.hooks],
    ),
  )
}

function v4Slot0Slot(poolId) {
  return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'uint256'], [poolId, V4_POOLS_SLOT]))
}

// Slot0 packing: sqrtPriceX96 (160 bits) | tick (int24) | protocolFee | lpFee.
function decodeV4Tick(slot0Word) {
  const raw = (BigInt(slot0Word) >> 160n) & 0xffffffn
  return Number(raw >= 0x800000n ? raw - 0x1000000n : raw)
}

// Concentrated-position token amounts (same math as addUniV3LikePosition).
function v3PositionAmounts({ liquidity, tickLower, tickUpper, tick }) {
  const sa = tickToPrice(tickLower / 2)
  const sb = tickToPrice(tickUpper / 2)
  let amount0 = 0
  let amount1 = 0
  if (tick < tickLower) {
    amount0 = (liquidity * (sb - sa)) / (sa * sb)
  } else if (tick < tickUpper) {
    const sp = tickToPrice(tick) ** 0.5
    amount0 = (liquidity * (sb - sp)) / (sp * sb)
    amount1 = liquidity * (sp - sa)
  } else {
    amount1 = liquidity * (sb - sa)
  }
  return { amount0, amount1 }
}

function addPricedLegs(api, currency0, currency1, amount0, amount1) {
  if (amount0 > 0 && isPriced(currency0)) api.add(pricedToken(currency0), amount0)
  if (amount1 > 0 && isPriced(currency1)) api.add(pricedToken(currency1), amount1)
}

async function nightshadesTvl(api) {
  if (!liveAt(api, CIV_STACK_BLOCK)) return
  const WETH = ADDRESSES.robinhood.WETH
  // Escrowed raises still inside the anti-snipe window (pre-bond) + the
  // vault's earmarked snipe-tax WETH (boost pot / LP pots / free quote).
  await sumTokens2({ api, owners: [CIV_ANTI_SNIPE_PAD, CIV_FACTION_VAULT], tokens: [WETH] })

  // Bonded factions: one protocol-owned v4 position per faction, keyed to
  // the vault address (no position NFT — read liquidity + ticks off the
  // vault, the pool tick off PoolManager.extsload).
  const count = Number(await api.call({ abi: civVaultAbi.factionCount, target: CIV_FACTION_VAULT }))
  if (!count) return
  const factionIds = await api.multiCall({
    abi: civVaultAbi.factionIds,
    target: CIV_FACTION_VAULT,
    calls: Array.from({ length: count }, (_, i) => i),
  })
  const [factions, liquidities] = await Promise.all([
    api.multiCall({ abi: civVaultAbi.faction, target: CIV_FACTION_VAULT, calls: factionIds }),
    api.multiCall({ abi: civVaultAbi.positionLiquidity, target: CIV_FACTION_VAULT, calls: factionIds }),
  ])
  const slot0s = await api.multiCall({
    abi: extsloadAbi,
    target: UNI_V4_POOL_MANAGER,
    calls: factions.map((f) => v4Slot0Slot(v4PoolId(f.key))),
  })
  factions.forEach((f, i) => {
    const liquidity = Number(liquidities[i])
    if (!liquidity) return
    const { amount0, amount1 } = v3PositionAmounts({
      liquidity,
      tickLower: Number(f.tickLower),
      tickUpper: Number(f.tickUpper),
      tick: decodeV4Tick(slot0s[i]),
    })
    // Faction tokens stay unpriced — only the WETH quote leg.
    addPricedLegs(api, f.key.currency0, f.key.currency1, amount0, amount1)
  })
}

async function v4BoxTvl(api) {
  if (!liveAt(api, V4_BOX_BLOCK)) return
  // V4 box mints raw PoolManager positions (salt = bytes32(lockTokenId)), so
  // there is no posm NFT to resolve. Walk every minted lock id (receipt NFT
  // _nextTokenId) and value remaining liquidity at the live pool tick.
  const lastId = await lastMintedLockId(api, V4_BOX_LOCKER)
  if (!lastId) return
  const ids = Array.from({ length: lastId }, (_, i) => i + 1)
  const locks = await api.multiCall({
    abi: v4LockAbi,
    target: V4_BOX_LOCKER,
    calls: ids,
    permitFailure: true,
  })
  const open = []
  locks.forEach((l, i) => {
    if (!l) return
    const initial = BigInt(l.initialLiquidity || 0)
    const withdrawn = BigInt(l.withdrawnLiquidity || 0)
    if (l.closed || initial === 0n || withdrawn >= initial) return
    // At least one priced leg. Spam locks on the V4 box planted absurd
    // liquidity on fake pools that share a priced quote — those are
    // dropped by the remaining-liquidity ceiling + post-math amount cap
    // below (real locks are well under both).
    if (!isPriced(l.currency0) && !isPriced(l.currency1)) return
    const remaining = initial - withdrawn
    // Hard ceiling on raw liquidity — spam ids sat at 1e27–1e30.
    if (remaining > 10n ** 24n) return
    open.push({
      id: ids[i],
      currency0: l.currency0,
      currency1: l.currency1,
      fee: l.fee,
      tickSpacing: l.tickSpacing,
      hooks: l.hooks,
      tickLower: Number(l.tickLower),
      tickUpper: Number(l.tickUpper),
      liquidity: Number(remaining),
    })
  })
  if (!open.length) return
  const slot0s = await api.multiCall({
    abi: extsloadAbi,
    target: UNI_V4_POOL_MANAGER,
    calls: open.map((l) =>
      v4Slot0Slot(
        v4PoolId({
          currency0: l.currency0,
          currency1: l.currency1,
          fee: l.fee,
          tickSpacing: l.tickSpacing,
          hooks: l.hooks,
        }),
      ),
    ),
  })
  // Skip any position whose priced ETH/WETH leg is absurd (spam). STONKBROKER
  // / USDG legs can honestly be large in wei, so the cap is ETH-only.
  const MAX_ETH_AMOUNT = 5e21 // 5,000 ETH
  open.forEach((l, i) => {
    const { amount0, amount1 } = v3PositionAmounts({
      liquidity: l.liquidity,
      tickLower: l.tickLower,
      tickUpper: l.tickUpper,
      tick: decodeV4Tick(slot0s[i]),
    })
    const eth0 = isEthLike(l.currency0) ? amount0 : 0
    const eth1 = isEthLike(l.currency1) ? amount1 : 0
    if (eth0 > MAX_ETH_AMOUNT || eth1 > MAX_ETH_AMOUNT) return
    addLegs(api, l.currency0, l.currency1, amount0, amount1)
  })
}

async function upV2BoxTvl(api) {
  if (!liveAt(api, UP_V2_BOX_BLOCK)) return
  // up. V2 lockers escrow Solidly-style LP tokens in per-lock vaults (or a
  // gauge while staked). Value the remaining LP share of pool reserves.
  // Both legs are credited; a known quote is still required so a two-meme
  // spam lock cannot enter.
  const lastId = await lastMintedLockId(api, UP_V2_BOX_LOCKER)
  if (!lastId) return
  const ids = Array.from({ length: lastId }, (_, i) => i + 1)
  const locks = await api.multiCall({
    abi: upV2LockAbi,
    target: UP_V2_BOX_LOCKER,
    calls: ids,
    permitFailure: true,
  })
  const open = []
  locks.forEach((l) => {
    if (!l || !l.pool || l.pool === ADDRESSES.null) return
    const initial = BigInt(l.initialAmount || 0)
    const withdrawn = BigInt(l.withdrawnAmount || 0)
    if (l.closed || initial === 0n || withdrawn >= initial) return
    if (!isPriced(l.token0) && !isPriced(l.token1)) return
    open.push({
      pool: l.pool,
      token0: l.token0,
      token1: l.token1,
      remaining: initial - withdrawn,
    })
  })
  if (!open.length) return
  const [supplies, reserves] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: open.map((l) => l.pool) }),
    api.multiCall({ abi: 'function getReserves() view returns (uint256,uint256)', calls: open.map((l) => l.pool) }),
  ])
  open.forEach((l, i) => {
    const supply = BigInt(supplies[i] || 0)
    if (supply === 0n) return
    const r0 = BigInt(reserves[i][0] || reserves[i]['0'] || 0)
    const r1 = BigInt(reserves[i][1] || reserves[i]['1'] || 0)
    const amount0 = (r0 * l.remaining) / supply
    const amount1 = (r1 * l.remaining) / supply
    addLegs(api, l.token0, l.token1, amount0.toString(), amount1.toString())
  })
}

async function everListedVaults(api, registry, fromBlock) {
  // all() is the live listing. Delist removes a vault from that array but
  // does not move its position NFT, so deposits in a delisted vault would
  // vanish from TVL. VaultListed is the full set; union both.
  const toBlock = api.block == null ? await api.getBlock() : Number(api.block)
  const [listed, logs] = await Promise.all([
    api.call({ abi: 'address[]:all', target: registry }),
    api.getLogs({
      target: registry,
      eventAbi: 'event VaultListed(address indexed vault, address indexed pool, uint8 mode)',
      fromBlock,
      toBlock,
      onlyArgs: true,
      maxBlockRange: 100000,
    }),
  ])
  const set = new Set()
  const add = (vault) => {
    if (!vault || vault === ADDRESSES.null) return
    set.add(ethers.getAddress(vault))
  }
  listed.forEach(add)
  for (const log of logs) add(log.vault ?? log[0])
  return [...set]
}

async function smartLpTvl(api, registry, nftAddress, fromBlock) {
  const vaults = await everListedVaults(api, registry, fromBlock)
  if (!vaults.length) return
  await sumTokens2({
    api,
    owners: vaults,
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress },
  })
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
  ])
  const ownerTokens = vaults.map((vault, i) => [[token0s[i], token1s[i]], vault])
  await sumTokens2({ api, ownerTokens })
}

async function tvl(api) {
  // Uniswap V3 box positions — both legs counted; DefiLlama prices what it
  // knows and leaves the rest at $0 (same discipline as Smart LP).
  await sumTokens2({
    api,
    owner: V3_BOX_LOCKER,
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM },
  })
  // up. DEX (Slipstream) box positions, incl. all Safe Launch locked pools.
  // Called directly because the slipstream resolver has no Robinhood default
  // NFPM and the shared sumTokens2 config cannot carry a second one.
  await unwrapSlipstreamNFT({
    api,
    owner: UP_CL_BOX_LOCKER,
    nftAddress: UP_SLIPSTREAM_NFPM,
  })
  // Canonical ETH/STONKBROKER v4 LP in the ownerless forever escrow (posm #175704).
  if (liveAt(api, FOREVER_ESCROW_BLOCK)) {
    await sumTokens2({
      api,
      owner: FOREVER_ESCROW,
      resolveUniV4: true,
      uniV4ExtraConfig: { positionIds: [FOREVER_POSM_ID] },
    })
  }
  // Uniswap v4 box locker (raw PoolManager positions). Both legs, with
  // spam-liquidity guards (see v4BoxTvl).
  await v4BoxTvl(api)
  // up. V2 LP locker (Solidly-style pool LP). Both legs.
  await upV2BoxTvl(api)
  // Smart LP vaults: registry-enumerated, each vault owns one Uniswap V3
  // position on the canonical NFPM. Both position legs are counted (quote
  // legs are WETH/USDG; base legs are tokenized stocks / ecosystem tokens),
  // plus the idle token0/token1 balances each vault holds between compounds.
  if (liveAt(api, SMART_LP_REGISTRY_BLOCK)) {
    await smartLpTvl(api, SMART_LP_REGISTRY, UNI_V3_NFPM, SMART_LP_REGISTRY_BLOCK)
  }
  // Nightshades anti-snipe launch: escrowed raise + vault pots + bonded v4 LP.
  await nightshadesTvl(api)
  return api.getBalances()
}

async function arbitrumTvl(api) {
  await smartLpTvl(api, ARB_SMART_LP_REGISTRY, ARB_UNI_V3_NFPM, ARB_SMART_LP_FROM_BLOCK)
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is liquidity locked across the Safety Deposit Box family on Robinhood Chain: Uniswap V3 position NFTs in the V3 box; up. DEX Slipstream positions in the up. CL box (including every Stonklauncher / Safe Launch graduation pool — raise + LP tax reserve locked forever at bond); Uniswap v4 PoolManager positions in the V4 box (both legs, liquidity and ETH-amount guards against spam locks); up. V2 Solidly-style LP in the up. V2 box (both legs); and the ownerless forever-escrow holding the canonical ETH/STONKBROKER Uniswap v4 LP (posm #175704). Every locker position counts both legs — DefiLlama prices known tokens and leaves the rest at $0. Plus Smart LP (Volatility Farming) vaults on Robinhood Chain and Arbitrum One: every vault the registry has ever listed (delist only hides a vault from the UI; its position NFT stays put) on canonical Uniswap V3 pools — each vault owns one position NFT (both legs counted) plus idle balances held between compounds. Plus the Nightshades anti-snipe launch (Civilization faction tokens launched through the StonkBrokers CivAntiSnipePad): the WETH raise escrowed in the pad pre-bond, the snipe-tax WETH earmarked in the FactionLiquidityVault, and priced legs of each bonded faction\'s protocol-owned Uniswap v4 position. Staking tracks STONKBROKER tokens in the escrow contract.',
  doublecounted: true,
  robinhood: {
    tvl,
    staking: sumTokensExport({ owner: STONK_ESCROW, tokens: [STONKBROKER] }),
  },
  arbitrum: {
    start: '2026-09-15',
    tvl: arbitrumTvl,
  },
}
