const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x194Db21D9108f9da7a4E21f367d0eb8f8979144e) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  milkomeda: {
    tvl: getUniTVL({ factory: '0x194Db21D9108f9da7a4E21f367d0eb8f8979144e', useDefaultCoreAssets: true }),
  },
};
