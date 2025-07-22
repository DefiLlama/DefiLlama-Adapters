const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x24dF3F586b3d313A98704478f83a4315ae5b19A9) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: getUniTVL({ factory: '0x24dF3F586b3d313A98704478f83a4315ae5b19A9', useDefaultCoreAssets: true }),
  },
};