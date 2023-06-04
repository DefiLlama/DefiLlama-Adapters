const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x7096Cebc52012e2611a1E88c45bC54ee2A88dcB4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
  methodology: "Counts liquidity in pools",
};