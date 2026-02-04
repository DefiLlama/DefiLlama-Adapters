const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  songbird: {
    tvl: getUniTVL({ factory: '0x875b815a1D1b12a6fee3c068a7c43F80e4a50234', useDefaultCoreAssets: true, }),
  },
  flare: {
    tvl: getUniTVL({ factory: '0x440602f459D7Dd500a74528003e6A20A46d6e2A6', useDefaultCoreAssets: true, }),
  },
}