const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address on bsc (0x94b4188D143b9dD6bd7083aE38A461FcC6AAd07E) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: getUniTVL({ factory: '0x94b4188D143b9dD6bd7083aE38A461FcC6AAd07E', useDefaultCoreAssets: true }),
  },
};
