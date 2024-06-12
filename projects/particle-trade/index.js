const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  blast: {
    tvl: sumTokensExport({
      owner: '0x121B5ac4De4a3E6F4171956BC26ceda40Cb61a56',
      tokens: [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH, '0x216a5a1135a9dab49fa9ad865e0f22fe22b5630a'],
      resolveUniV3: true,
    })
  }
}