const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

// Aquila V2 - UniswapV2 fork (constant-product AMM).
const AQUILA = {
  ethereum: '0x7bad585c3ae4ae266f92a4af13b388bc7b26067c',
  optimism: '0x3B2C6fe3039B42f00E98b76531C05932abfB258e',
  arbitrum: '0xEca3EA559b7566e610d113bbA8D1B15B085C9c68',
  base:     '0xA5cA8Ba2e3017E9aF3Bd9EDa69e9E8C263Abf6cD',
}

// CLMM V3 — UniswapV3 fork (concentrated liquidity).
const CLMM = {
  ethereum: { factory: '0xDf62D9e51d7c08360dcd41931A2e6B97FF8C73E8', fromBlock: 24_780_521 },
  optimism: { factory: '0x53f64267EDE764C53ABEbCc768aD7A96c6006D8a', fromBlock: 149_697_019 },
  arbitrum: { factory: '0x045B7012CbD158C1b48874310F985Adb48aA62ba', fromBlock: 447_703_806 },
  base: { factory: '0xB5E5A9e628FEF819150A6E5127aB481cee5d6Ca9', fromBlock: 44_100_001 },
}

// Classic V1 — RubiconMarket on-chain order book (oasisdex-style).
const RUBICON_MARKET = {
  optimism: '0x7a512d3609211e719737E82c7bb7271eC05Da70d',
  arbitrum: '0xC715a30FDe987637A082Cf5F19C74648b67f2db8',
  base:     '0x9A5215E96E1185d4e6002C95C3Cc0aB6eEaD354F',
}

// Bath-pool ERC20 vaults hold maker token reserves on Optimism (no bath pools
// were deployed for Arbitrum or Base Classic per docs.rubicon.finance).
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

const CLASSIC_TOKENS = {
  optimism: [
    ADDRESSES.optimism.USDC_CIRCLE,
    ADDRESSES.optimism.sUSD,
    ADDRESSES.optimism.WSTETH,
    '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819', // LUSD
    '0x9bcef72be871e61ed4fbbc7630889bee758eb81d', // rETH
    '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6', // LINK
    '0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1', // WLD
    '0x920cf626a271321c151d027030d5d08af699456b', // KWENTA
    '0x9e1028f5f1d5ede59748ffcee5532509976840e0', // PERP
  ],
  arbitrum: [
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.USDC_CIRCLE,
    ADDRESSES.arbitrum.USDC,
    ADDRESSES.arbitrum.USDT,
    ADDRESSES.arbitrum.DAI,
    ADDRESSES.arbitrum.FRAX,
    ADDRESSES.arbitrum.WBTC,
    ADDRESSES.arbitrum.WSTETH,
    ADDRESSES.arbitrum.ARB,
    ADDRESSES.arbitrum.LINK,
    ADDRESSES.arbitrum.GMX,
    '0x93b346b6bc2548da6a1e7d98e9a421b42541425b', // LUSD
    '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33', // GHO
    '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8', // rETH
    '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8', // PENDLE
    '0x9623063377ad1b27544c965ccd7342f7ea7e88c7', // GRT
    '0x4cb9a7ae498cedcbb5eae9f25736ae7d428c9d66', // XAI
    '0x539bde0d7dbd336b79148aa742883198bbf60342', // MAGIC
    '0x18c11fd286c5ec11c3b683caa813b77f5163a122', // GNS
  ],
  base: [
    ADDRESSES.base.WETH,
    ADDRESSES.base.USDbC,
    ADDRESSES.base.USDC,
    ADDRESSES.base.DAI,
    ADDRESSES.base.USDT,
    ADDRESSES.base.WBTC,
    ADDRESSES.base.cbBTC,
    ADDRESSES.base.cbETH,
    ADDRESSES.base.wstETH,
    '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b', // VIRTUAL
    '0x940181a94a35a4569e4529a3cdfb74e38fd98631', // AERO
    '0xb3836098d1e94ec651d74d053d4a0813316b2a2f', // RUBI
  ],
}

async function classicTvl(api) {
  const chain = api.chain
  const market = RUBICON_MARKET[chain]
  if (!market) return {}

  const pools = BATH_POOLS[chain] || []
  const discovered = (await api.multiCall({
    abi: 'address:underlyingToken',
    calls: pools,
  })).map(t => String(t).toLowerCase())

  // dynamically discovered bath assets + canonical listed registry
  const tokens = [...new Set([...discovered, ...(CLASSIC_TOKENS[chain] || [])])]
  if (!tokens.length) return {}

  const owners = [market, ...pools]
  return sumTokens2({ api, tokens, owners })
}

const aquilaExports = uniTvlExports(AQUILA)
const clmmExports = uniV3Export(CLMM)

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'Sums tokens locked across Rubicon\'s liquidity systems: Classic V1 (RubiconMarket order book ' +
    'plus Optimism bath-pool vaults), Aquila V2 (UniswapV2-fork AMM), and CLMM V3 (UniswapV3-fork ' +
    'concentrated liquidity).',
  hallmarks: [
    ['2021-11-12', 'Classic Launch on Optimism'],      // first post-regenesis trade
    ['2023-06-21', 'Arbitrum Launch'],                 // first Arb offer
    ['2023-08-08', 'Base Launch'],                     // Base RubiconMarket deploy
    ['2025-01-17', 'Aquila V2 Launch'],                // factories deployed on OP/Arb/Base with ETH factory followed 2025-02-10
    ['2026-03-31', 'CLMM V3 Launch'],                  // factories deployed on all 4 chains
    ['2026-05-04', 'RUBI Liquidity Migrated to CLMM'], // treasury moved ~449M RUBI into CLMM v3 WETH/RUBI + USDC/RUBI pools
  ],
}

Object.keys(CLMM).forEach(chain => {
  module.exports[chain] = {
   tvl: sdk.util.sumChainTvls([
    aquilaExports[chain].tvl,
    clmmExports[chain].tvl,
    classicTvl,
   ])
  }
})
