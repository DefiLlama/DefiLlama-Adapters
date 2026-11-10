const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require('../helper/treasury')

// Kalos revenue flow on Kinetiq Elysium: every Kalos fee (marketplace, mint, trade, DEX protocol fee) is paid to the
// revenue splitter (KalosRevenueSplitterV2 proxy), which splits it 20% each to the four Kalos vaults below and to the
// KalosReferralPool (0xADC8a8D0a7153C00c3eEBc3E9082F5aCdA6a7311, not counted: it pays referrers and returns the rest to the vaults).
// All five contracts are owned by the Kalos permission controller 0xCA10547F62feA6BBb777f0b50a9aF0B08F3eF28B (two signers).
const SPLITTER = '0xcA105395094Ceb27e6AfdA492c6379cBF468CDb8' // fees received but not yet distributed
const VAULTS = [
  '0xca10595e1F7a722ed80A6BEc7Ac27d183F3C541C', // KalosVault: Treasury
  '0xCA1058B5339e97cE75AB2885A56570Ecb2F54881', // KalosVault: Team
  '0xcA10538C4e513512cf1a222A2e00cF720b9CA9Cc', // KalosVault: Rewards
  '0xCA105Dd42d1563889D4eF0905Fdf91E97517Df46', // KalosVault: Liquidity
]

module.exports = treasuryExports({
  elysium: {
    owners: [SPLITTER, ...VAULTS],
    tokens: [
      nullAddress,
      ADDRESSES.elysium.WHYPE,
      ADDRESSES.elysium.USDC,
      ADDRESSES.elysium.USDT0,
      ADDRESSES.elysium.kHYPE,
      '0xe45a355d9e9cAd2aD85F2d03E3eE3102A036acF0', // KNTQ (Kinetiq): Kalos fees on KNTQ trades are taken in KNTQ
    ],
  },
})
