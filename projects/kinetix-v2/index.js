const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({
      factory: "0xE8E917BC80A26CDacc9aA42C0F4965d2E1Fa52da",
      useDefaultCoreAssets: true,
    }),
  },
  base: {
    tvl: getUniTVL({
      factory: "0x8aD3d3e6B1b7B65138bD508E48330B544539b2C3",
      useDefaultCoreAssets: true,
    }),
  },
};
