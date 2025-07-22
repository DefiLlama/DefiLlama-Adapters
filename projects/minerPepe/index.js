const { sumTokensExport } = require("../helper/unknownTokens")
const ADDRESSES = require('../helper/coreAssets.json')
const LPS = ["0xd60f323965eD3D6b90e66eA676414A31D53A0b98"]
const TOKENS = ["0x6d306C2C9CD931160763D99376a68C14D33DC954"]

module.exports = {
  methodology:
    "MinerPepe  the first mining PEPE Meme Coin on Binance Smart Chain. Miners enjoy 12% daily returns in BNB and MPEPE tokens",
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x93Fb89601B5C3253b50c8d650C11bDfe5FB7EE3F'],
        ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", '0x18951EEe359A98fFC22b7F22641Db6E7f8571A5A'],
      ]
    }),
    staking: sumTokensExport({ owners: ['0x26e6B07013748a1C9C12ff17A51A95e40456689C'], tokens: TOKENS, lps: LPS, useDefaultCoreAssets: true, }),
  },
}