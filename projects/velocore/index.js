const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '', useDefaultCoreAssets: true, hasStablePools: true })
  },
  methodology: "Counts liquidity in pools",
};