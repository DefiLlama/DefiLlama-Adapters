// SoneVibe: VibeSwap (Uniswap V2-style DEX) + SoneVibe Lending (Compound V2-style)
// Addresses: https://github.com/SoneVibe/Lending/blob/main/docs/networks.json
const { getUniTVL } = require('../helper/cache/uniswap')
const { compoundExports2 } = require('../helper/compound')
const { mergeExports } = require('../helper/utils')

const dex = {
  soneium: '0x06C0b58287794a0bdce20ce768b601CA974618DC',
  bsc: '0xaf905e66038EcE89e03D843B35a11D262053B630',
  arbitrum: '0xA95107ebE4e54480bA755061eF3207c3421150f0',
  // Astar 0x1b404A1e41cCe5f98DC9CBF0c1372F8b68e2588c was retired 2026-11-23.
  // Historical TVL already stored on DefiLlama is left untouched.
}

// Drain-free Soneium factory, deployed 2026-11-10 03:56:01 UTC (block 30574105),
// tx 0x69f8165d69abe21ac04f9e9b2e05e67fe97a2fd7ee976d97732068c0a2e57ad4.
// The original soneium factory stays in `dex` so historical TVL still reads those pairs.
const soneiumNewFactory = '0x77b141dCFDa726e239efF005E3DE7A47AeBFf948'
const soneiumNewFactoryStartBlock = 30574105

// New BSC factory, deployed 2026-11-22 04:31:58 UTC (block 135015600),
// tx 0x6932510372c01bbb24097137f34411ee1b7c4d45a2c308e2e83b5d72ce3823fd.
// The original bsc factory stays in `dex` so historical TVL still reads those pairs.
const bscNewFactory = '0x26b13e7e923e964b0514B3167A90901B49DAe205'
const bscNewFactoryStartBlock = 135015600

const lending = {
  // V_Master has no getAllMarkets(), so markets are pinned (from networks.json)
  // Arbitrum One has an empty master and no cTokens there, so it stays DEX-only.
  soneium: { comptroller: '0x1126859aB6911Fc3b4f86f2F65E7B6F2eEDe5185', markets: ['0x7CA06966B0c07C5e35aA180643E98bB3057EBb27', '0xDB3e66b87c42C7F3599fbdcBFe08DfF0689A6D77', '0x96ae93Df119c131469b38e3d558899F23678dCFb'] },
}

const dexExports = {}
Object.entries(dex).forEach(([chain, factory]) => {
  dexExports[chain] = { tvl: getUniTVL({ factory, useDefaultCoreAssets: true }) }
})
// Chain start only. A root start would hide Soneium, Astar, and BSC history.
// Factory creation: block 521383212, 2026-11-05T05:04:30Z,
// tx 0xd2cebb74373f703a9b8ca8e1d2cc059f33fabd40713701dfc46c374079e6635d.
// Block lookup may land up to 5 minutes early, so this start is 05:09:30Z.
// allPairsLength is still 0 then. The WETH/USDC pair is created in block 521390325 at 05:41:58Z.
dexExports.arbitrum.start = 1793855370

const soneiumNewFactoryTVL = getUniTVL({ factory: soneiumNewFactory, useDefaultCoreAssets: true })
const soneiumNewExports = {
  soneium: {
    tvl: async (api) => {
      if (api.block != null && Number(api.block) < soneiumNewFactoryStartBlock) return {}
      return soneiumNewFactoryTVL(api)
    },
  },
}

const bscNewFactoryTVL = getUniTVL({ factory: bscNewFactory, useDefaultCoreAssets: true })
const bscNewExports = {
  bsc: {
    tvl: async (api) => {
      if (api.block != null && Number(api.block) < bscNewFactoryStartBlock) return {}
      return bscNewFactoryTVL(api)
    },
  },
}

const lendingExports = {}
Object.entries(lending).forEach(([chain, config]) => {
  lendingExports[chain] = compoundExports2(config)
})

module.exports = mergeExports([dexExports, soneiumNewExports, bscNewExports, lendingExports])
module.exports.methodology = 'DEX TVL: reserves of all VibeSwap pairs created by the factories (core assets only). On Soneium this includes the original factory 0x06C0b58287794a0bdce20ce768b601CA974618DC, kept for history, and the drain-free factory 0x77b141dCFDa726e239efF005E3DE7A47AeBFf948 from block 30574105 (2026-11-10). On BSC this includes the original factory 0xaf905e66038EcE89e03D843B35a11D262053B630, kept for history, and the factory 0x26b13e7e923e964b0514B3167A90901B49DAe205 from block 135015600 (2026-11-22). Lending TVL: underlying tokens held by SoneVibe cTokens listed by the comptroller; borrowed = total borrows. Arbitrum counts those factory reserves only; that chain has no comptroller or cTokens. Astar was retired on 2026-11-23 and is no longer counted in new snapshots; historical TVL already stored is left untouched.'





























































