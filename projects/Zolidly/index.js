const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ 
        factory: '0x6E1315819908Eaa036405f405c033cC2BfFBFc75', 
        useDefaultCoreAssets: true,
        hasStablePools: true,
    })
  },
  methodology: "Counts liquidity in pools",
};