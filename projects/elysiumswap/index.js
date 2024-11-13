const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  elsm: {
    tvl: getUniTVL({ factory: '0x5bec5d65fAba8E90e4a74f3da787362c60F22DaE', useDefaultCoreAssets: true }),
  },
};
