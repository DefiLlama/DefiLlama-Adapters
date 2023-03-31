const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0xF5719b1Ea3C9bF6491E22C49379E31060d0FbFc1', useDefaultCoreAssets: true, hasStablePools: true })
  },
  methodology: "Counts liquidity in pools",
};