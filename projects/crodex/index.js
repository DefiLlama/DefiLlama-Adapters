const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: getUniTVL({ factory: '0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/crodex/index.js
