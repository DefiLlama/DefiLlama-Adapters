const { sumTokensExport } = require('../helper/unwrapLPs.js')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x9a7e4c8fe2679D43145Da69ff191a5C9F841996b'],
        [ADDRESSES.sonic.USDC_e, '0xed286fd8f8364058778B80D69b2158Dd09edb634'],
        [ADDRESSES.sonic.scUSD, '0x575a809Ccc7d1e90D717b4E66928289F2d09db8F'],
      ]
    })
  }
}