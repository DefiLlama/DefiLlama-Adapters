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
        ADDRESSES.hyperliquid.USDC,
        '0x6B9E773128f453f5c2C60935Ee2DE2CBc5390A24'
      ],
      [
        ADDRESSES.hyperliquid.USDC,
        '0xdb861e302ef7b7578a448e951aede06302936c28'
      ],
      [
        ADDRESSES.hyperliquid.USDC,
        '0xc20699185c15d0a2fd65779bb5d69f5b0b113c00'
      ],
      [
        ADDRESSES.hyperliquid.USDC,
        '0x4E5319dEb1072B01439EE674db5C321d11fd96F8'
      ],
    ]})
  }
}
