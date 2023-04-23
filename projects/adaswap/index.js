const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe07C22C184ca252A525511B798BB8Ce96abDCc5b) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  milkomeda: {
    tvl: getUniTVL({ factory: '0xe07C22C184ca252A525511B798BB8Ce96abDCc5b', chain: 'milkomeda', useDefaultCoreAssets: true, }),
  },
};