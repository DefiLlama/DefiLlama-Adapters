const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
  methodology:
    "Factory address (0xba831e62ac14d8500cef0367b14f383d7b1b1b0a) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ubiq: {
    tvl: getUniTVL({ factory: '0xba831e62ac14d8500cef0367b14f383d7b1b1b0a', useDefaultCoreAssets: true }),
  },
};
