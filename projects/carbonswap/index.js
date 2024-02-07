const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address (0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  energyweb: {
    tvl: getUniTVL({
      factory: '0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd',
      useDefaultCoreAssets: true,
    })
  }
};
