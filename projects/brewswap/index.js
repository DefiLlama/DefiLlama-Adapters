const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x563c86d9F17914FF868BCbe3903B3ef829A82F9E) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  polygon: {
    tvl: getUniTVL({ factory: '0x563c86d9F17914FF868BCbe3903B3ef829A82F9E', chain: 'polygon', useDefaultCoreAssets: true }),
  },
}; // node test.js projects/brewswap/index.js
