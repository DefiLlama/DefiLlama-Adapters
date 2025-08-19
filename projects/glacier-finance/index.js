const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking');

module.exports = {
  avax: {
    tvl: getUniTVL({ factory: '0xaC7B7EaC8310170109301034b8FdB75eCa4CC491', useDefaultCoreAssets: true,  hasStablePools: true }),
    staking: staking("0xed1eE3f892fe8a13A9BE02F92E8FB7410AA84739", "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6"),
  },
};
