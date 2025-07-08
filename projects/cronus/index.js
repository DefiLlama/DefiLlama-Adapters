const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x20570b7bFf86B2f92068622D0805160f318554Be) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: getUniTVL({ factory: '0x20570b7bFf86B2f92068622D0805160f318554Be', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/cronus/index.js
