const { sumTokensExport } = require("../helper/unknownTokens")
const ADDRESSES = require('../helper/coreAssets.json')
const LPS = ["0x7cb4161cA48617d438Af3c8E130E4D0D8Ec80823"]
const TOKENS = ["0x488739D593DC2BC13Fd738CBaa35498bad5F8556"]

module.exports = {
  methodology:
    "PizzaX is a Defi Miners. A fun platform to generate 15%/Day ROI for Lifetime — Pool as a Service (PAAS)",
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x0c869d0de4f0f3119b96221c0ef4849cb1f1e583'],
        [ADDRESSES.bsc.USDT, '0xaE13bba370E2A8D2Fa651C60a4B628CA71615ef0'],
      ]
    }),
    staking: sumTokensExport({ owners: ['0x1A504B8b13AC0e80f235D850FC1484EaA7633B51'], tokens: TOKENS, lps: LPS, useDefaultCoreAssets: true, }),
  },
}