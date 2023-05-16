const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x1715a3E4A142d8b698131108995174F37aEBA10D) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    pulse: {
    tvl: getUniTVL({ factory: '0x1715a3E4A142d8b698131108995174F37aEBA10D', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/pulsex/index.js