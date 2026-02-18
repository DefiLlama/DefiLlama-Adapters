const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x8148fc43c38796F794700d93482160F8c858D1Aa) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereumclassic: {
    tvl: getUniTVL({
        factory: '0x8148fc43c38796F794700d93482160F8c858D1Aa',
        useDefaultCoreAssets: true,
    }),
  },
};
