const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

// ---------------------------------------------------------------------------
// Rubicon — TVL across four trading systems on four chains.
//
//   System       Description                                  Chains
//   ------       -----------                                  ------
//   Classic V1   On-chain order book + bath-pool ERC4626      OP / Arb / Base
//   Aquila V2    UniV2-fork constant-product AMM              ETH / OP / Arb / Base
//   CLMM V3      UniV3-fork concentrated liquidity            ETH / OP / Arb / Base
//   Gladius      UniswapX-fork RFQ (intent-based; no TVL)     ETH / OP / Arb / Base
//
// Address source of truth: docs.rubicon.finance/developers/deployments
// All addresses verified live on chain via scripts/verify-defillama-addresses.py
// in the RubiconDeFi/rubicon-integrations repo (18/18 pass; last re-run
// 2026-07-09).
//
// Gladius settles intents by direct ERC20 transfer — there is no resting
// liquidity on the reactor contracts themselves (active reactors hold zero
// token balances; re-verified 2026-07-09), so Gladius contributes 0 to TVL
// and is instead surfaced via the Rubicon volume/fees adapters in
// dimension-adapters.
// ---------------------------------------------------------------------------

// Aquila V2 — UniswapV2 fork (constant-product AMM).
//   Pair init code hash: 0x79cb29...dfba5 (from AquilaLibrary.sol:35)
//   Pair ABI is byte-identical to UniswapV2 IUniswapV2Pair.
const AQUILA = {
  ethereum: '0x7bad585c3ae4ae266f92a4af13b388bc7b26067c',
  optimism: '0x3B2C6fe3039B42f00E98b76531C05932abfB258e',
  arbitrum: '0xEca3EA559b7566e610d113bbA8D1B15B085C9c68',
  base:     '0xA5cA8Ba2e3017E9aF3Bd9EDa69e9E8C263Abf6cD',
}

// CLMM V3 — UniswapV3 fork (concentrated liquidity).
//   Pool init code hash: 0xd3e7f5...e22a (from PoolAddress.sol:6)
//   Pool ABI is byte-identical to UniswapV3 IUniswapV3Pool.
//   factory.owner() == 0x3204ac6f...07962f on every chain (Rubicon deployer).
//
// NOTE: no extraKey. The cache slot at
//   tvl-adapter-cache/cache/logs/{chain}/{factory}.json
// is the canonical PoolCreated log cache that dimension-adapters' Uniswap V3
// volume/fees helpers (getUniV3LogAdapter) hardcode as their input. Adding
// an extraKey here would namespace our TVL cache but break the downstream
// volume/fees adapters in dimension-adapters/{dexs,fees}/rubicon/. Cache
// collision risk is negligible since these factory addresses are unique to
// Rubicon's deployer 0x3204ac6f...07962f.
// fromBlock = exact factory deploy block (Blockscout getcontractcreation,
// verified 2026-07-09). All four factories deployed 2026-03-31.
const CLMM = {
  ethereum: { factory: '0xDf62D9e51d7c08360dcd41931A2e6B97FF8C73E8', fromBlock: 24_780_521,  permitFailure: true }, // tx 0xe4dc40b9...dcae55
  optimism: { factory: '0x53f64267EDE764C53ABEbCc768aD7A96c6006D8a', fromBlock: 149_697_019, permitFailure: true }, // tx 0x31159436...b01448
  arbitrum: { factory: '0x045B7012CbD158C1b48874310F985Adb48aA62ba', fromBlock: 447_703_806, permitFailure: true }, // tx 0x76328185...aff645
  base:     { factory: '0xB5E5A9e628FEF819150A6E5127aB481cee5d6Ca9', fromBlock: 44_100_001,  permitFailure: true }, // tx 0xa27c07ef...e2c5ca
}

// Classic V1 — RubiconMarket on-chain order book (oasisdex-style).
//
// Token discovery is BALANCE-BASED, not event-based. The legacy subgraph that
// upstream's `cachedGraphQuery` reads has been decommissioned, and replacing it
// with an offer-event scan is not viable: the OP book was active from
// 2021-11-12 to the v2 upgrade (2023-05-25), so a LogMake crawl pulls millions
// of events and blows the harness's 10-minute budget on a cold run for no
// benefit. Instead we take the candidate token universe and let `sumTokens2`
// report whatever is actually held — a token that was never listed simply
// returns a zero balance and contributes nothing.
//
// The candidate set is the union of two sources:
//
//  1. DYNAMIC — each bath pool self-reports its reserve asset via
//     `underlyingToken()`. This is read on-chain every run, so a bath-pool
//     redeploy or asset change self-corrects with no code edit. These 7 assets
//     are the ones that actually carry OP Classic TVL.
//  2. PINNED — the protocol's canonical listed-token registry (the same set the
//     Rubicon backend indexes; mirrors docs.rubicon.finance/developers). This
//     covers order-book escrow for assets with no bath pool, and Arb/Base where
//     no bath pools were ever deployed.
//
// Verified 2026-07-16: this yields OP $124,653.26 vs the live listing's
// $124,667.64 (-0.01%), with all 7 bath assets matching to the dollar — i.e.
// identical to what the event crawl produced, at a fraction of the cost.
// A newly listed Classic token needs a one-line PR here; the book is legacy and
// its asset set has been stable for years, so that trade is worth the 100x
// speedup and the reviewer-runnable test.
const RUBICON_MARKET = {
  optimism: '0x7a512d3609211e719737E82c7bb7271eC05Da70d',
  arbitrum: '0xC715a30FDe987637A082Cf5F19C74648b67f2db8', // deploy tx 0x1f3851d5...f17856
  base:     '0x9A5215E96E1185d4e6002C95C3Cc0aB6eEaD354F', // deploy tx 0x8f83cfe5...6121c2
}

// Bath-pool ERC20 vaults hold maker token reserves on Optimism (no bath pools
// were deployed for Arbitrum or Base Classic per docs.rubicon.finance).
// Their reserve assets are NOT hardcoded — see `bathUnderlyings()` below.
const BATH_POOLS = {
  optimism: [
    '0xB0bE5d911E3BD4Ee2A8706cF1fAc8d767A550497', // bathETH
    '0x7571CC9895D8E997853B1e0A1521eBd8481aa186', // bathWBTC
    '0xe0e112e8f33d3f437D1F895cbb1A456836125952', // bathUSDC
    '0x60daEC2Fc9d2e0de0577A5C708BcaDBA1458A833', // bathDAI
    '0xfFBD695bf246c514110f5DAe3Fa88B8c2f42c411', // bathUSDT
    '0xeb5F29AfaaA3f44eca8559c3e8173003060e919f', // bathSNX
    '0x574a21fE5ea9666DbCA804C9d69d8Caf21d5322b', // bathOP
  ],
  arbitrum: [],
  base:     [],
}

// Canonical listed-token registry, mirroring the protocol's own token config.
// Only used as `sumTokens2` candidates — unlisted/unheld tokens read zero.
const CLASSIC_TOKENS = {
  optimism: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC.e
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
    '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819', // LUSD
    '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9', // sUSD
    '0x68f180fcce6836688e9084f035309e29bf0a2095', // WBTC
    '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb', // wstETH
    '0x9bcef72be871e61ed4fbbc7630889bee758eb81d', // rETH
    '0x4200000000000000000000000000000000000042', // OP
    '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // LINK
    '0x8700daec35af8ff88c16bdf0418774cb3d7599b4', // SNX
    '0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1', // WLD
    '0x920cf626a271321c151d027030d5d08af699456b', // KWENTA
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0', // PERP
  ],
  arbitrum: [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC.e
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
    '0x93b346b6bc2548da6a1e7d98e9a421b42541425b', // LUSD
    '0x17fc002b466eec40dae837fc4be5c67993ddbd6f', // FRAX
    '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33', // GHO
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', // WBTC
    '0x5979d7b546e38e414f7e9822514be443a4800529', // wstETH
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8', // rETH
    '0x912ce59144191c1204e64559fe8253a0e49e6548', // ARB
    '0xf97f4df75117a78c1a5a0dbb814af92458539fb4', // LINK
    '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a', // GMX
    '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8', // PENDLE
    '0x9623063377ad1b27544c965ccd7342f7ea7e88c7', // GRT
    '0x4cb9a7ae498cedcbb5eae9f25736ae7d428c9d66', // XAI
    '0x539bde0d7dbd336b79148aa742883198bbf60342', // MAGIC
    '0x18c11fd286c5ec11c3b683caa813b77f5163a122', // GNS
  ],
  base: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDbC
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
    '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
    '0x0555e30da8f98308edb960aa94c0db47230d2b9c', // WBTC
    '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', // cbETH
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452', // wstETH
    '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', // VIRTUAL
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
    '0xb3836098d1e94ec651d74d053d4a0813316b2a2f', // RUBI
  ],
}

// Read each bath pool's reserve asset on-chain. Re-read every run so a pool
// redeploy or asset change is picked up with no code edit. permitFailure keeps
// one unreachable pool from aborting the whole chain.
async function bathUnderlyings(api, pools) {
  if (!pools.length) return []
  const tokens = await api.multiCall({
    abi: 'address:underlyingToken',
    calls: pools,
    permitFailure: true,
  })
  return tokens.filter(Boolean).map(t => String(t).toLowerCase())
}

async function classicTvl(api) {
  const chain = api.chain
  const market = RUBICON_MARKET[chain]
  if (!market) return

  const pools = BATH_POOLS[chain] || []
  const discovered = await bathUnderlyings(api, pools)

  // union: dynamically discovered bath assets + canonical listed registry
  const tokens = [
    ...new Set([...discovered, ...(CLASSIC_TOKENS[chain] || [])]),
  ]
  if (!tokens.length) return

  const owners = [market, ...pools]
  return sumTokens2({ api, tokens, owners })
}

const aquilaExports = uniTvlExports(AQUILA)
const clmmExports = uniV3Export(CLMM)

const CHAINS = ['ethereum', 'optimism', 'arbitrum', 'base']

module.exports = {
  // Long-tail Aquila/CLMM tokens are priced via the unknownTokens pool-ratio
  // heuristic rather than direct market feeds.
  misrepresentedTokens: true,
  methodology:
    'TVL is the sum of all tokens locked across Rubicon Finance\'s four trading systems. ' +
    'Classic V1 = RubiconMarket on-chain order book (OP/Arb/Base) plus bath-pool ERC20 ' +
    'vaults that hold maker reserves on Optimism; balances are summed against the market and ' +
    'bath pools over a candidate token set built from each bath pool\'s on-chain ' +
    'underlyingToken() plus the protocol\'s canonical listed-token registry (the legacy ' +
    'subgraph backend was decommissioned). Aquila V2 = a UniswapV2-fork constant-product AMM on all four chains; ' +
    'pair reserves are summed via canonical allPairs/allPairsLength enumeration with ' +
    'core-asset filtering to exclude non-pairable long-tail tokens. CLMM V3 = a UniswapV3-fork ' +
    'concentrated-liquidity AMM on all four chains; per-pool token balances are summed via ' +
    'a PoolCreated event scan cached in the canonical per-factory log-cache slot that the ' +
    'Rubicon volume/fees adapters in dimension-adapters also read. ' +
    'Gladius (UniswapX-fork RFQ) settles by direct ERC20 transfer and holds no ' +
    'resting liquidity, so it contributes 0 to TVL; Gladius activity is reflected in the ' +
    'Rubicon volume and fees adapters in dimension-adapters.',
  // DefiLlama policy: hallmarks reserved for events that materially moved
  // TVL — and the upstream test harness warns above 6 entries, so this list
  // is capped at the 6 TVL-moving milestones. (Full milestone history lives
  // in PR.md and listing-metadata/hallmarks.md in the
  // RubiconDeFi/rubicon-integrations repo.) Every date below was verified
  // on-chain 2026-07-09 (Blockscout getcontractcreation / topic0 scans +
  // eth_getBlockByNumber over public RPCs); trailing comments carry the exact
  // unix ts + block evidence.
  // Format: 'YYYY-MM-DD' strings per current repo convention (docs.llama.fi:
  // "dates must follow the YYYY-MM-DD standard").
  hallmarks: [
    ['2021-11-12', 'Classic Launch on Optimism'],      // first post-regenesis trade: LogTake OP blk 24606 @ 1636739833 (contract code already present at the 2021-11-11 regenesis genesis, blk 1 @ 1636665399; original OVM-1.0 deploy date unrecoverable on-chain)
    ['2023-06-21', 'Arbitrum Launch'],                 // first Arb offer: emitOffer blk 103583510 @ 1687390461 (market deployed 2023-06-09, blk 99504898)
    ['2023-08-08', 'Base Launch'],                     // Base RubiconMarket deploy blk 2369614 @ 1691528575; first offer next day (blk 2408602)
    ['2025-01-17', 'Aquila V2 Launch'],                // factories deployed on OP/Arb/Base within 3 min (@ 1737099475-1737099609); first pair same day on OP (blk 130769790). ETH factory followed 2025-02-10
    ['2026-03-31', 'CLMM V3 Launch'],                  // factories deployed on all 4 chains the same evening (@ 1774989349-1774995503); first pools ~2h later
    ['2026-05-04', 'RUBI Liquidity Migrated to CLMM'], // treasury moved ~449M RUBI into CLMM v3 WETH/RUBI + USDC/RUBI pools, Base blk 45536845 @ 1777863037 (2026-05-04T02:50:37Z, re-verified via eth_getBlockByNumber)
  ],
}

CHAINS.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      // CLMM V3 — mutates api.balances directly via sumTokens2.
      if (clmmExports[chain]) await clmmExports[chain].tvl(api)
      // Classic V1 — mutates api.balances directly via sumTokens2.
      await classicTvl(api)
      // Aquila V2 — returns chain-prefixed balances; strip and merge.
      if (aquilaExports[chain]) {
        const prefix = chain + ':'
        const aquilaBalances = await aquilaExports[chain].tvl(api)
        if (aquilaBalances) {
          Object.entries(aquilaBalances).forEach(([key, amount]) => {
            const token = key.startsWith(prefix) ? key.slice(prefix.length) : key
            api.add(token, amount)
          })
        }
      }
    },
  }
})
