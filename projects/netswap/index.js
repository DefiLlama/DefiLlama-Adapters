const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x70f51d68D16e8f9e418441280342BD43AC9Dff9f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  metis: {
    tvl: getUniTVL({ factory: '0x70f51d68D16e8f9e418441280342BD43AC9Dff9f', useDefaultCoreAssets: true }),
  },
};