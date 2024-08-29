const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xB438dee6a8875AFAbB8a82e86ef56C4DEEe5D1b5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  bsc: {
    tvl: getUniTVL({ factory: '0xB438dee6a8875AFAbB8a82e86ef56C4DEEe5D1b5', useDefaultCoreAssets: true})
  }
}; // node test.js projects/boomswap/index.js
