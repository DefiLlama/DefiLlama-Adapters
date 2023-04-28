const { getUniTVL } = require("../helper/unknownTokens");
const { staking, stakingPricedLP } = require('../helper/staking');

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({ factory: '0xaC7B7EaC8310170109301034b8FdB75eCa4CC491', useDefaultCoreAssets: true,  hasStablePools: true }),
    staking: stakingPricedLP("0xed1eE3f892fe8a13A9BE02F92E8FB7410AA84739", "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", "avax", "0x2071a39da7450d68e4f4902774203df208860da2", "avalanche-2"),
  },
};
