const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xbC467D80AD6401dC25B37EB86F5fcd048Ae4BF6d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  arbitrum: {
    tvl: getUniTVL({ factory: '0xbC467D80AD6401dC25B37EB86F5fcd048Ae4BF6d', chain: 'arbitrum', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/oasisswapdex/index.js