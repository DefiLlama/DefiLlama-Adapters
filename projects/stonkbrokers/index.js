const ethers = require('ethers')
const { sumTokens2, unwrapSlipstreamNFT, sumTokensExport, addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

// Safety Deposit Box lockers: Uniswap V3 box + up. DEX (Slipstream) box (which
// also holds every Safe Launch graduation pool, locked forever at bond) +
// Uniswap v4 box (raw PoolManager positions, no NFT) + up. V2 LP box + the
// ownerless forever-escrow holding the canonical ETH/STONKBROKER v4 LP.
const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'
const V4_BOX_LOCKER = '0x5a28ce098750f73bc9eC142D4bCE464E1A0BBdA6'
const UP_V2_BOX_LOCKER = '0x21797736C25851A6102D196afbA78F978f589017'
const FOREVER_ESCROW = '0x1338c12dAb6D80313819612784cC3C5bfaaD7f4d'
const FOREVER_POSM_ID = 175704
const UNI_V4_STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b'
// StonkLockerOwnershipNFT: slot 8 is _nextTokenId (no public getter).
const LOCK_NFT_NEXT_ID_SLOT = 8

// First block each surface exists; calls before it revert.
const V4_BOX_BLOCK = 19331425
const FOREVER_ESCROW_BLOCK = 19498880
const UP_V2_BOX_BLOCK = 32711195
const SMART_LP_REGISTRY_BLOCK = 55893170
const CIV_STACK_BLOCK = 62553796

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'
const ROBINHOOD_CBBTC = '0xCEC185eB182c47d1bA1EFc84e6959e18cd620Be4'
const UP_TOKEN = '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1' // up. DEX token, most of its liquidity sits outside the lockers
// Only the quote side of locked positions counts: the other legs are launched
// tokens whose only price source is the locked pool itself.
const QUOTE_TOKENS = [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ROBINHOOD_CBBTC, UP_TOKEN]

// Smart LP (Volatility Farming): immutable concentrated-liquidity vaults on
// canonical Uniswap V3 pools, enumerated from a chain-local registry.
const SMART_LP_REGISTRY = '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146'
const ARB_SMART_LP_REGISTRY = '0xFB2eA53b16C07011d4390A2e449385180A54eD5e'
const ARB_SMART_LP_FROM_BLOCK = 505000000
const ARB_UNI_V3_NFPM = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'

// Nightshades (Civilization) anti-snipe launch: WETH raise escrowed in the pad
// until bond, then a protocol-owned v4 position keyed to the faction vault.
const CIV_ANTI_SNIPE_PAD = '0xca389585c4940B107D49AF4A37aD259c5fb69081'
const CIV_FACTION_VAULT = '0xfff716727d7E80E29eab5D3498b7F28431e65C58'

const abi = {
  factionIds: 'function factionIds(uint256) view returns (bytes32)',
  faction: 'function faction(bytes32) view returns (address token, bool tokenIs0, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper)',
  positionLiquidity: 'function positionLiquidity(bytes32) view returns (uint128)',
  v4Lock: 'function lockPositions(uint256) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks, int24 tickLower, int24 tickUpper, uint128 initialLiquidity, uint128 withdrawnLiquidity, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed)',
  upV2Lock: 'function lockPositions(uint256) view returns (address pool, address vault, address token0, address token1, uint256 lockTokenId, uint256 initialAmount, uint256 withdrawnAmount, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed, address gauge)',
  getSlot0: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
}

const liveAt = (api, block) => api.block == null || Number(api.block) >= block

async function lastMintedLockId(api, locker) {
  const nft = await api.call({ abi: 'address:lockNft', target: locker })
  const next = await api.provider.getStorage(nft, LOCK_NFT_NEXT_ID_SLOT, api.block ?? 'latest')
  return Number(BigInt(next)) - 1
}

const poolId = (k) => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'uint24', 'int24', 'address'],
  [k.currency0, k.currency1, k.fee, k.tickSpacing, k.hooks],
))

// Raw PoolManager positions (no posm NFT): { key, tickLower, tickUpper, liquidity }
async function addV4Positions(api, positions) {
  if (!positions.length) return
  const slot0s = await api.multiCall({ abi: abi.getSlot0, target: UNI_V4_STATE_VIEW, calls: positions.map((p) => poolId(p.key)) })
  positions.forEach((p, i) => addUniV3LikePosition({
    api, token0: p.key.currency0, token1: p.key.currency1, liquidity: p.liquidity,
    tickLower: +p.tickLower, tickUpper: +p.tickUpper, tick: +slot0s[i].tick,
  }))
}

async function v4BoxTvl(api) {
  if (!liveAt(api, V4_BOX_BLOCK)) return
  const lastId = await lastMintedLockId(api, V4_BOX_LOCKER)
  const locks = await api.multiCall({ abi: abi.v4Lock, target: V4_BOX_LOCKER, calls: Array.from({ length: lastId }, (_, i) => i + 1), permitFailure: true })
  const positions = []
  locks.forEach((l) => {
    if (!l || l.closed) return
    const liquidity = BigInt(l.initialLiquidity) - BigInt(l.withdrawnLiquidity)
    // Spam locks planted 1e27-1e30 liquidity on fake pools; real locks are far below 1e24.
    if (liquidity <= 0n || liquidity > 10n ** 24n) return
    positions.push({ key: l, tickLower: l.tickLower, tickUpper: l.tickUpper, liquidity: Number(liquidity) })
  })
  await addV4Positions(api, positions)
}

async function upV2BoxTvl(api) {
  if (!liveAt(api, UP_V2_BOX_BLOCK)) return
  const lastId = await lastMintedLockId(api, UP_V2_BOX_LOCKER)
  const locks = await api.multiCall({ abi: abi.upV2Lock, target: UP_V2_BOX_LOCKER, calls: Array.from({ length: lastId }, (_, i) => i + 1), permitFailure: true })
  locks.forEach((l) => {
    if (!l || l.closed) return
    const remaining = BigInt(l.initialAmount) - BigInt(l.withdrawnAmount)
    if (remaining > 0n) api.add(l.pool, remaining.toString())
  })
  await sumTokens2({ api, resolveLP: true })
}

async function nightshadesTvl(api) {
  if (!liveAt(api, CIV_STACK_BLOCK)) return
  await sumTokens2({ api, owners: [CIV_ANTI_SNIPE_PAD, CIV_FACTION_VAULT], tokens: [ADDRESSES.robinhood.WETH] })
  const factionIds = await api.fetchList({ lengthAbi: 'uint256:factionCount', itemAbi: abi.factionIds, target: CIV_FACTION_VAULT })
  const [factions, liquidities] = await Promise.all([
    api.multiCall({ abi: abi.faction, target: CIV_FACTION_VAULT, calls: factionIds }),
    api.multiCall({ abi: abi.positionLiquidity, target: CIV_FACTION_VAULT, calls: factionIds }),
  ])
  const positions = factions.map((f, i) => ({ ...f, liquidity: Number(liquidities[i]) })).filter((p) => p.liquidity > 0)
  await addV4Positions(api, positions)
}

async function smartLpTvl(api, registry, nftAddress, fromBlock) {
  // all() is the live listing; a delisted vault keeps its position NFT, so
  // union it with every VaultListed event. Each vault owns one position NFT
  // (both legs counted) plus idle balances held between compounds.
  const [listed, logs] = await Promise.all([
    api.call({ abi: 'address[]:all', target: registry }),
    getLogs2({ api, target: registry, fromBlock, eventAbi: 'event VaultListed(address indexed vault, address indexed pool, uint8 mode)' }),
  ])
  const vaults = [...new Set([...listed, ...logs.map((l) => l.vault)].map((v) => v.toLowerCase()))]
  if (!vaults.length) return
  await sumTokens2({ api, owners: vaults, resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
  ])
  await sumTokens2({ api, ownerTokens: vaults.map((vault, i) => [[token0s[i], token1s[i]], vault]) })
}

async function tvl(api) {
  await sumTokens2({ api, owner: V3_BOX_LOCKER, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM } })
  // Called directly: the slipstream resolver has no Robinhood default NFPM.
  await unwrapSlipstreamNFT({ api, owner: UP_CL_BOX_LOCKER, nftAddress: UP_SLIPSTREAM_NFPM })
  if (liveAt(api, FOREVER_ESCROW_BLOCK))
    await sumTokens2({ api, owner: FOREVER_ESCROW, resolveUniV4: true, uniV4ExtraConfig: { positionIds: [FOREVER_POSM_ID] } })
  await v4BoxTvl(api)
  await upV2BoxTvl(api)
  await nightshadesTvl(api)
  // Lockers: keep only the quote legs.
  const quotes = new Set(QUOTE_TOKENS.map((t) => `${api.chain}:${t}`.toLowerCase()))
  api.deleteTokens(Object.keys(api.getBalances()).filter((t) => !quotes.has(t.toLowerCase())))

  if (liveAt(api, SMART_LP_REGISTRY_BLOCK)) await smartLpTvl(api, SMART_LP_REGISTRY, UNI_V3_NFPM, SMART_LP_REGISTRY_BLOCK)
  // The protocol's own token is tracked under staking, not TVL.
  api.removeTokenBalance(STONKBROKER)
}

async function arbitrumTvl(api) {
  await smartLpTvl(api, ARB_SMART_LP_REGISTRY, ARB_UNI_V3_NFPM, ARB_SMART_LP_FROM_BLOCK)
}

module.exports = {
  methodology:
    'TVL is the liquidity locked in the Safety Deposit Box lockers on Robinhood Chain: Uniswap V3 position NFTs in the V3 box, up. DEX (Slipstream) positions in the up. CL box (including every Stonklauncher / Safe Launch graduation pool, whose raise + LP tax reserve is locked forever at bond), Uniswap v4 PoolManager positions in the V4 box, up. V2 LP in the up. V2 box, and the ownerless forever-escrow holding the canonical ETH/STONKBROKER Uniswap v4 LP. Only the quote side (ETH, WETH, USDG, cbBTC, UP) of each locked position is counted; launched-token legs stay unpriced and STONKBROKER is excluded from TVL. Plus the Smart LP (Volatility Farming) vaults on Robinhood Chain and Arbitrum One: every vault the registry has ever listed, each owning one Uniswap V3 position NFT (both legs counted) plus idle balances held between compounds. Plus the Nightshades anti-snipe launch: the WETH raise escrowed in the pad pre-bond, the snipe-tax WETH held in the FactionLiquidityVault, and the WETH leg of each bonded faction\'s protocol-owned Uniswap v4 position. Staking tracks STONKBROKER tokens in the escrow contract.',
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
