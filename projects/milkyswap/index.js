const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  milkomeda: {
    tvl: getUniTVL({ factory: '0xD6Ab33Ad975b39A8cc981bBc4Aaf61F957A5aD29', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/milkyswap/index.js
