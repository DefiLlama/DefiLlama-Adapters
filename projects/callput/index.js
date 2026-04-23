const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  base: {
    tvl: sumTokensExport({ 
      owners: [
        "0xF9Ba07Ba4aD84D6Af640ebf28E2B98c135a207A3",
      ], 
      tokens: [
        ADDRESSES.base.USDC
      ]
    })
  },
}