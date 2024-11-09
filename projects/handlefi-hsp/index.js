const { sumTokensExport } = require("../helper/unwrapLPs")

const hspPool = "0x5CE8dDD04F3576C93eDdDf0eb58bf2c7f643Ad0A"
const fxTokens = {
  usd: "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F",
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: hspPool, tokens: [] }),
  },
  methodology: "TVL on arbitrum is the sum of all handle synthetic perpetuals (hSP) deposits",
}
