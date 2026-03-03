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
  }, 
  hyperliquid: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [
        "0xb88339cb7199b77e23db6e890353e22632ba630f",
        '0x6B9E773128f453f5c2C60935Ee2DE2CBc5390A24'
      ],
    ]})
  }
}