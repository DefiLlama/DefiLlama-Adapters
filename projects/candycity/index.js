const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x84343b84EEd78228CCFB65EAdEe7659F246023bf) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: getUniTVL({ factory: '0x84343b84EEd78228CCFB65EAdEe7659F246023bf', chain: 'cronos', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/crodex/index.js
