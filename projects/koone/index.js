const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x6167ce530e710e29d0F32CFe50062028800e5918', useDefaultCoreAssets: true })
  },
  methodology: "Counts liquidity in pools",
};