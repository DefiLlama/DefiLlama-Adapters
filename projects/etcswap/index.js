const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x0307cd3d7da98a29e6ed0d2137be386ec1e4bc9c) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereumclassic: {
    tvl: getUniTVL({
        factory: '0x0307cd3d7da98a29e6ed0d2137be386ec1e4bc9c',
        useDefaultCoreAssets: true,
    })
  },
}; // node test.js projects/etcswap/index.js