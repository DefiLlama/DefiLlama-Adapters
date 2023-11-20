const { sumTokens2 } = require("../helper/unwrapLPs")
const {pool2 } = require("../helper/pool2")

const chain = 'arbitrum'

// Arbitrum TVL.
const treasury = "0x5CE8dDD04F3576C93eDdDf0eb58bf2c7f643Ad0A"
const fxTokens = {
  usd: "0x8616E8EA83f048ab9A5eC513c9412Dd2993bcE3F",
}

function tvl(_, _b, {[chain]: block }) {
  return sumTokens2({
    chain,
    block, tokensAndOwners: [
    [fxTokens.usd, treasury],
  ] })
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: "TVL on arbitrum is the sum of all handle synthetic perpetuals (hSP) deposits",
}
