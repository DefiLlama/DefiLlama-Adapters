const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [
        ADDRESSES.arbitrum.USDC,
        '0xc67e9efdb8a66a4b91b1f3731c75f500130373a4'
      ],
      [
        ADDRESSES.arbitrum.USDC_CIRCLE,
        '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7'
      ]
    ]})
  }
}