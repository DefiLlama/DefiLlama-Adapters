const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0xE980FD1dEA4E93c25B7f5B27351CF069C4f63a41',
        '0xE26f15B3cc23e8a5adE4c10CCc69e50520eE2a89',
        '0x5954B84F4ba745E1A85E9A5875ce3bDf863200ba',
        '0xaaa5a76b9397eE41309CC15Bd71a5ae99662d6cd',
        '0x3cF1A20AE73ff128D3A40F4492fdE59F2B2D1e8C',
        '0x1eb466780e412C796A7BEdA541CfF47E0571A000',
        '0x1DDD814589376Db497F91eFD2E6AFF969822a951'
      ],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.null, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.ARB]
    })
  },
}
