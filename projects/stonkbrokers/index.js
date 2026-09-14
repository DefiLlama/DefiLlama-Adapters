const ethers = require('ethers')
const { sumTokens2, unwrapSlipstreamNFT, sumTokensExport } = require('../helper/unwrapLPs')
const { tickToPrice } = require('../helper/utils/tick')
const ADDRESSES = require('../helper/coreAssets.json')

// Safety Deposit Box — Uniswap V3 box locker (position NFTs escrowed
// permanently or on long vests) + the up. DEX (Slipstream) box locker, which
// also holds every Safe Launch pad graduation pool (100% of each launch's
// raise + LP tax reserve is locked there forever at bond).
const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

// Smart LP (Volatility Farming) — immutable concentrated-liquidity vaults on
// canonical Uniswap V3 pools. The on-chain registry is the single discovery
// surface; each listed vault owns exactly one NFPM position plus small idle
// token balances between compounds.
const SMART_LP_REGISTRY = '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146'

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
// PoolManager `_pools` mapping slot (Pool.State is at storage slot 6).
const V4_POOLS_SLOT = 6n

const civVaultAbi = {
  factionCount: 'uint256:factionCount',
  factionIds: 'function factionIds(uint256) view returns (bytes32)',
  faction:
    'function faction(bytes32 factionId) view returns (address token, bool tokenIs0, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper)',
  positionLiquidity: 'function positionLiquidity(bytes32 factionId) view returns (uint128)',
}
const extsloadAbi = 'function extsload(bytes32 slot) view returns (bytes32)'

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

// WETH-side value of a concentrated position (same math as
// addUniV3LikePosition, but only the quote leg is credited — faction tokens
// stay unpriced like every other locker meme leg).
function v3QuoteLegAmount({ liquidity, tickLower, tickUpper, tick, quoteIs0 }) {
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
  return quoteIs0 ? amount0 : amount1
}

async function nightshadesTvl(api) {
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
    const quoteIs0 = f.key.currency0.toLowerCase() === WETH.toLowerCase()
    const amount = v3QuoteLegAmount({
      liquidity,
      tickLower: Number(f.tickLower),
      tickUpper: Number(f.tickUpper),
      tick: decodeV4Tick(slot0s[i]),
      quoteIs0,
    })
    api.add(WETH, amount)
  })
}

async function tvl(api) {
  // Uniswap V3 box positions (WETH side only — meme pair legs stay unpriced).
  await sumTokens2({
    api,
    owner: V3_BOX_LOCKER,
    resolveUniV3: true,
    uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
    uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM },
  })
  // up. DEX (Slipstream) box positions, incl. all Safe Launch locked pools.
  // Called directly because the slipstream resolver has no Robinhood default
  // NFPM and the shared sumTokens2 config cannot carry a second one.
  await unwrapSlipstreamNFT({
    api,
    owner: UP_CL_BOX_LOCKER,
    nftAddress: UP_SLIPSTREAM_NFPM,
    whitelistedTokens: [ADDRESSES.robinhood.WETH],
  })
  // Smart LP vaults: registry-enumerated, each vault owns one Uniswap V3
  // position on the canonical NFPM. Both position legs are counted (quote
  // legs are WETH/USDG; base legs are tokenized stocks / ecosystem tokens),
  // plus the idle token0/token1 balances each vault holds between compounds.
  const smartLpVaults = await api.call({ abi: 'address[]:all', target: SMART_LP_REGISTRY })
  if (smartLpVaults.length) {
    await sumTokens2({
      api,
      owners: smartLpVaults,
      resolveUniV3: true,
      uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM },
    })
    const [token0s, token1s] = await Promise.all([
      api.multiCall({ abi: 'address:token0', calls: smartLpVaults }),
      api.multiCall({ abi: 'address:token1', calls: smartLpVaults }),
    ])
    const ownerTokens = smartLpVaults.map((vault, i) => [[token0s[i], token1s[i]], vault])
    await sumTokens2({ api, ownerTokens })
  }
  // Nightshades anti-snipe launch: escrowed raise + vault pots + bonded v4 LP.
  await nightshadesTvl(api)
  return api.getBalances()
}

module.exports = {
  methodology:
    'TVL is the liquidity permanently locked in the Safety Deposit Box lockers: Uniswap V3 position NFTs escrowed in the V3 box, plus up. DEX (Slipstream) positions escrowed in the up. box — including every Stonklauncher / Safe Launch graduation pool across the V1 ETH pad, V1 quoted lanes, V2 lanes, and r2 pads (raise + LP tax reserve locked forever at bond; V2 Uniswap-v3 venue bonds land in the V3 box). Only the WETH side of each locker position is counted (meme-token legs stay unpriced). Plus the Smart LP (Volatility Farming) vaults: registry-listed immutable concentrated-liquidity vaults on canonical Uniswap V3 pools — each vault owns one position NFT (both legs counted: WETH/USDG quote side and the tokenized-stock / ecosystem-token base side) plus idle balances held between compounds. Plus the Nightshades anti-snipe launch (Civilization faction tokens launched through the StonkBrokers CivAntiSnipePad, 99%→1% decaying snipe tax over a 99-minute window): the WETH raise escrowed in the pad pre-bond, the snipe-tax WETH earmarked in the FactionLiquidityVault (night boost pot + per-faction LP pots), and the WETH leg of each bonded faction\'s protocol-owned Uniswap v4 position (raw PoolManager position keyed to the vault; faction-token legs stay unpriced). Staking tracks STONKBROKER tokens in the escrow contract.',
  doublecounted: true,
  robinhood: {
    tvl,
    staking: sumTokensExport({ owner: STONK_ESCROW, tokens: [STONKBROKER] }),
  },
}
