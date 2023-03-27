const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sMLP' })
  },
  methodology: "Counts liquidity in pools",
};