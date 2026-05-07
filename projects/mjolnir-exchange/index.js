const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  hemi: {
    tvl: sumTokensExport({ owner: '0xB1def8509EDc2aB66e9bf52507bbba9Cc4205ADa', tokens: [
      ADDRESSES.hemi.WBTC,
      ADDRESSES.hemi.WETH,
      ADDRESSES.hemi.USDT,
      ADDRESSES.hemi.USDC_e,
      "0xAA40c0c7644e0b2B224509571e10ad20d9C4ef28"
    ]})
  },
}
