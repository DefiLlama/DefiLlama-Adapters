const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x4be5Bf2233a0fd2c7D1472487310503Ec8E857be) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  telos: {
    tvl: getUniTVL({ factory: '0x4be5Bf2233a0fd2c7D1472487310503Ec8E857be', useDefaultCoreAssets: true }),
  },
};