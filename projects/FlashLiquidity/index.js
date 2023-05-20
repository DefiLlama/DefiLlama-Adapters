const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x6e553d5f028bD747a27E138FA3109570081A23aE"

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      factory: factory,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
  polygon_zkevm: {
    tvl: getUniTVL({
      factory: factory,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  },
  methodology:
    "TVL comes from the DEX liquidity pools"
};