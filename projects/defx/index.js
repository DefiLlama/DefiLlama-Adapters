const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        '0x091486F9427cf07942fa17Ad7194BE3feaDfa46d'
      ]
    ]})
  }
}