const { getUniTVL } = require("../helper/unknownTokens");

const factory = '0x653FB617210ca72DC938f8f4C75738F2B4b88d7B'

module.exports = {
  misrepresentedTokens: true,
  methodology: `TVL accounts for the liquidity found in each liquidity pair.`,
  harmony:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, })
  },
}