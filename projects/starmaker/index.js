const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x7096Cebc52012e2611a1E88c45bC54ee2A88dcB4', useDefaultCoreAssets: true, }),
  },
  mantle: {
    tvl: getUniTVL({ factory: '0x2a34936cd9441B7E7FB152c9C4e304be58e14830', useDefaultCoreAssets: true, }),
  },
  methodology: "Counts liquidity in pools",
};