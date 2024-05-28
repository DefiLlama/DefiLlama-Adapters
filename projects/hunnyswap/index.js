const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x0c6A0061F9D0afB30152b8761a273786e51bec6d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  avax: {
    tvl: getUniTVL({ factory: '0x0c6A0061F9D0afB30152b8761a273786e51bec6d', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/hunnyswap/index.js