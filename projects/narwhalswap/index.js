const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: '0xB9fA84912FF2383a617d8b433E926Adf0Dd3FEa1', useDefaultCoreAssets: true }),
  },
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://narwhalswap.org/#/dashboard as the source",
};
