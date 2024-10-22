const { getUniTVL } = require("../helper/unknownTokens");

const factory = "0x6e553d5f028bD747a27E138FA3109570081A23aE"
const tvl = getUniTVL({ factory, useDefaultCoreAssets: true,  })

module.exports = {
  misrepresentedTokens: true,
  polygon: { tvl, },
  polygon_zkevm: { tvl, },
  avax: { tvl, },
  base: { tvl, },
  arbitrum: { tvl, },
  methodology:
    "TVL comes from the DEX liquidity pools"
};
